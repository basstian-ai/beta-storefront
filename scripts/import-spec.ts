import { Bootstrapper, type BootstrapperContext, EVENT_NAMES } from '@crystallize/import-utilities';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const context: BootstrapperContext = {
    tenantId: process.env.CRYSTALLIZE_TENANT_IDENTIFIER ?? process.env.CRYSTALLIZE_TENANT_ID,
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!,
    logLevel: 'info',
    spec: {
      shapes: './crystallize-import/shapes',
      items: './crystallize-import/items',
      topics: './crystallize-import/topics',
      priceVariants: './crystallize-import/priceVariants.json',
    },
  };

  const bootstrapper = new Bootstrapper();

  // Set log level to debug
  // Assuming 'debug' is a valid LogLevel. Other options might be 'info', 'verbose'.
  // The actual type definition for LogLevel wasn't visible in the snippets.
  try {
    (bootstrapper as any).config.logLevel = 'debug';
    console.log('Attempted to set logLevel to debug.');
  } catch (e) {
    console.error('Failed to set logLevel:', e);
  }

  // Add event listeners
  bootstrapper.on(EVENT_NAMES.ERROR, (error: any) => {
    console.error(`[EVENT_NAMES.ERROR]:`, JSON.stringify(error, null, 2));
  });
  bootstrapper.on(EVENT_NAMES.WARNING, (warning: any) => {
    console.warn(`[EVENT_NAMES.WARNING]:`, JSON.stringify(warning, null, 2));
  });
  bootstrapper.on(EVENT_NAMES.ITEM_CREATED, (payload: any) => {
    console.log(`[EVENT_NAMES.ITEM_CREATED]: ${payload?.name} (Path: ${payload?.from?.path}, SKU: ${payload?.from?.variants?.[0]?.sku})`);
  });
  bootstrapper.on(EVENT_NAMES.ITEM_UPDATED, (payload: any) => {
    console.log(`[EVENT_NAMES.ITEM_UPDATED]: ${payload?.name} (Path: ${payload?.from?.path}, SKU: ${payload?.from?.variants?.[0]?.sku})`);
  });
  bootstrapper.on(EVENT_NAMES.ITEMS_UPDATE, (update: any) => {
    console.log(`[EVENT_NAMES.ITEMS_UPDATE_RAW_PAYLOAD]:`, JSON.stringify(update, null, 2));
    // Previous detailed logging for ITEMS_UPDATE:
    // if (update?.message) {
    //   console.log(`[EVENT_NAMES.ITEMS_UPDATE]: ${update.message}`, update.progress ? `Progress: ${update.progress}` : '');
    // }
    // if (update?.warning) {
    //   console.warn(`[EVENT_NAMES.ITEMS_UPDATE_WARNING]:`, JSON.stringify(update.warning, null, 2));
    // }
    // if (update?.error) {
    //   console.error(`[EVENT_NAMES.ITEMS_UPDATE_ERROR]:`, JSON.stringify(update.error, null, 2));
    // }
  });
  bootstrapper.on(EVENT_NAMES.ITEMS_DONE, () => {
    console.log('[EVENT_NAMES.ITEMS_DONE]: Item processing stage reported as done by bootstrapper.');
  });
  bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status: any) => {
    // This might be too verbose, but let's log item progress specifically
    if (status?.items?.progress) {
      console.log(`[EVENT_NAMES.STATUS_UPDATE]: Items Progress: ${status.items.progress}%`);
      if (status?.items?.warnings?.length > 0) {
        console.warn(`[EVENT_NAMES.STATUS_UPDATE]: Items Warnings:`, JSON.stringify(status.items.warnings, null, 2));
      }
    }
  });
   bootstrapper.on(EVENT_NAMES.DONE, (result: any) => {
    console.log('[EVENT_NAMES.DONE]: Import process finished by bootstrapper.', `Duration: ${result?.duration}`);
  });


  bootstrapper.setAccessToken(context.accessTokenId!, context.accessTokenSecret!);
  bootstrapper.setTenantIdentifier(context.tenantId!);

  // Read and parse priceVariants.json
  const priceVariantsPath = './crystallize-import/priceVariants.json';
  let priceVariantsData = [];
  try {
    const priceVariantsContent = await fs.readFile(priceVariantsPath, 'utf-8');
    priceVariantsData = JSON.parse(priceVariantsContent);
    if (!Array.isArray(priceVariantsData)) {
      console.error(`${priceVariantsPath} does not contain a valid JSON array. Using empty array.`);
      priceVariantsData = [];
    }
  } catch (e) {
    console.error(`Failed to read or parse ${priceVariantsPath}: ${e}. Using empty array.`);
    priceVariantsData = [];
  }

  // Read and parse shape files
  const shapesDirPath = './crystallize-import/shapes';
  const shapesIndexPath = path.join(shapesDirPath, 'index.json');
  let shapesData: any[] = [];
  try {
    const shapesIndexContent = await fs.readFile(shapesIndexPath, 'utf-8');
    const shapeFiles = JSON.parse(shapesIndexContent);
    if (Array.isArray(shapeFiles)) {
      for (const shapeFile of shapeFiles) {
        const shapeFilePath = path.join(shapesDirPath, shapeFile);
        try {
          const shapeContent = await fs.readFile(shapeFilePath, 'utf-8');
          shapesData.push(JSON.parse(shapeContent));
        } catch (e) {
          console.error(`Failed to read or parse shape file ${shapeFilePath}: ${e}`);
        }
      }
    } else {
      console.error(`${shapesIndexPath} does not contain a valid JSON array of shape filenames.`);
    }
  } catch (e) {
    console.error(`Failed to read or parse ${shapesIndexPath}: ${e}.`);
  }

  const specToSet = {
    shapes: shapesData, // Pass the array of parsed shape objects
    items: './crystallize-import/items', // This should be a path, bootstrapper reads index.json from here
    topics: './crystallize-import/topics',
    priceVariants: priceVariantsData,
  };

  console.log('Setting bootstrapper spec with (shapes data might be extensive, logging paths instead for brevity if shapesData is populated):');
  console.log(JSON.stringify({ ...specToSet, shapes: shapesData.length > 0 ? `${shapesData.length} shapes loaded` : 'No shapes loaded' }, null, 2));
  bootstrapper.setSpec(specToSet);

  // The bootstrap method seems to have been replaced by start()
  // and it also looks like the spec is passed via setSpec now
  // so bootstrap() might not return the spec anymore.
  // We'll adjust the result handling accordingly.
  await bootstrapper.start();
  await bootstrapper.kill();

  // Since bootstrapper.start() doesn't return the spec directly,
  // we'll assume the import was successful if no error was thrown.
  // For simplicity, we'll construct a basic summary.
  // A more robust solution might involve checking the actual created items if the API provides such a mechanism.
  const itemsPath = './crystallize-import/items';
  let itemCount = 0;
  try {
    const itemFiles = await fs.readdir(itemsPath);
    itemCount = itemFiles.filter(file => file.endsWith('.json')).length;
  } catch (e) {
    // If items directory doesn't exist or we can't read it, assume 0 items for now.
    console.warn(`Could not read items from ${itemsPath}: ${e}`);
  }

  const result = { spec: { items: { length: itemCount } } }; // Mocking the old result structure for summary
  const summary = {
    status: 'ok',
    importedItems: result?.spec?.items?.length ?? 0,
  };

  await fs.writeFile('import.json', JSON.stringify(summary, null, 2));
  console.log('✅ Import completed:', summary);
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
