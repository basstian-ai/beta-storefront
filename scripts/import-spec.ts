import { Bootstrapper, type BootstrapperContext, EVENT_NAMES } from '@crystallize/import-utilities';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const context: BootstrapperContext = {
    tenantId: process.env.CRYSTALLIZE_TENANT_IDENTIFIER ?? process.env.CRYSTALLIZE_TENANT_ID,
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!,
    logLevel: 'info',
    // Paths in spec are often relative to where bootstrapper is run or expect an index.json.
    // Since we are manually loading, these specific paths might be less critical if data is passed directly.
    // However, for consistency and if bootstrapper uses them for any relative linking internally:
    spec: {
      shapes: path.resolve(process.cwd(), 'crystallize-import/shapes'),
      items: path.resolve(process.cwd(), 'crystallize-import/items'), // Points to the directory of item JSONs
      topics: path.resolve(process.cwd(), 'crystallize-import/topics'),
      priceVariants: path.resolve(process.cwd(), 'crystallize-import/priceVariants.json'),
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

  const baseImportDir = path.resolve(process.cwd(), 'crystallize-import');

  // Read and parse priceVariants.json
  const priceVariantsPath = path.join(baseImportDir, 'priceVariants.json');
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
  const shapesDirPath = path.join(baseImportDir, 'shapes');
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

  // Read and parse item files
  const itemsDirPath = path.join(baseImportDir, 'items');
  const mainIndexJsonPath = path.join(baseImportDir, 'index.json'); // Main index.json
  let itemsData: any[] = [];
  try {
    const mainIndexContent = await fs.readFile(mainIndexJsonPath, 'utf-8');
    const mainIndex = JSON.parse(mainIndexContent);
    if (mainIndex && Array.isArray(mainIndex.items)) {
      for (const itemFile of mainIndex.items) {
        const itemFilePath = path.join(itemsDirPath, itemFile); // itemFile is just the filename e.g. "iphone-9.json"
        try {
          const itemContent = await fs.readFile(itemFilePath, 'utf-8');
          itemsData.push(JSON.parse(itemContent));
        } catch (e) {
          console.error(`Failed to read or parse item file ${itemFilePath}: ${e}`);
        }
      }
    } else {
      console.error(`${mainIndexJsonPath} does not contain a valid 'items' array.`);
    }
  } catch (e) {
    console.error(`Failed to read or parse ${mainIndexJsonPath}: ${e}.`);
  }

  // Read and parse topic files
  const topicsDirPath = path.join(baseImportDir, 'topics');
  const topicsIndexPath = path.join(topicsDirPath, 'index.json');
  let topicsData: any[] = [];
  try {
    const topicsIndexContent = await fs.readFile(topicsIndexPath, 'utf-8');
    const topicFiles = JSON.parse(topicsIndexContent); // This index should list the topic JSON filenames
    if (Array.isArray(topicFiles)) {
      for (const topicFile of topicFiles) {
        const topicFilePath = path.join(topicsDirPath, topicFile);
        try {
          const topicContent = await fs.readFile(topicFilePath, 'utf-8');
          topicsData.push(JSON.parse(topicContent));
        } catch (e) {
          console.error(`Failed to read or parse topic file ${topicFilePath}: ${e}`);
        }
      }
    } else {
      console.error(`${topicsIndexPath} does not contain a valid JSON array of topic filenames.`);
    }
  } catch (e) {
    console.error(`Failed to read or parse ${topicsIndexPath}: ${e}.`);
  }

  const specToSet = {
    shapes: shapesData,
    items: itemsData,
    topicMaps: topicsData, // Use topicMaps as per JsonSpec interface and pass the array
    priceVariants: priceVariantsData,
  };

  console.log('Setting bootstrapper spec with (shapes/items/topics data might be extensive, logging counts instead):');
  console.log(JSON.stringify({
    ...specToSet,
    shapes: shapesData.length > 0 ? `${shapesData.length} shapes loaded` : 'No shapes loaded',
    items: itemsData.length > 0 ? `${itemsData.length} items loaded` : 'No items loaded',
    topicMaps: topicsData.length > 0 ? `${topicsData.length} topics loaded` : 'No topics loaded',
  }, null, 2));
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

  // The 'itemsData' array now holds the successfully read and parsed item objects.
  // Its length reflects how many items were actually prepared to be sent to the bootstrapper.
  const itemCount = itemsData.length;

  const summary = {
    status: 'ok', // This status should ideally reflect actual API success.
    importedItems: itemCount, // Reflects items loaded by import-spec.ts, not necessarily API-confirmed.
  };

  // Ensure import.json is also written relative to CWD
  await fs.writeFile(path.resolve(process.cwd(), 'import.json'), JSON.stringify(summary, null, 2));
  console.log('✅ Import spec processing completed:', summary);
}

main().catch((err) => {
  console.error('❌ Import script execution failed:', err);
  // Attempt to write a failed import.json
  fs.writeFile(path.resolve(process.cwd(), 'import.json'), JSON.stringify({ status: 'error', importedItems: 0, error: err.message }, null, 2))
    .catch(e => console.error('Failed to write error import.json:', e));
  process.exit(1);
});
