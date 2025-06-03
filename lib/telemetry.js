import appInsights from 'applicationinsights';

export function setupTelemetry() {
  // APPLICATIONINSIGHTS_CONNECTION_STRING environment variable must be set to initialize telemetry.
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    console.log('[Telemetry] APPLICATIONINSIGHTS_CONNECTION_STRING not set. Skipping Application Insights initialization.');
    return;
  }

  try {
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoCollectConsole(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectDependencies(true)
      .start();

    // Set fixed-percentage sampling to 30%
    if (appInsights.defaultClient) {
      appInsights.defaultClient.config.samplingPercentage = 30;
    }

    console.log('[Telemetry] Application Insights initialized with 30% sampling.');
  } catch (error) {
    console.error('[Telemetry] Error setting up Application Insights:', error);
  }
}
