import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
    dsn: 'https://3c763fd474a599d5ff086725ee6e0a5f@o4508754224152576.ingest.us.sentry.io/4508754227232768',
    integrations: [nodeProfilingIntegration()],
    // Tracing
    tracesSampleRate: 1.0,
});

// Manually call startProfiler and stopProfiler to profile the code in between
Sentry.profiler.startProfiler();

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling your application until the process exits or stopProfiling is called.
Sentry.profiler.stopProfiler();
