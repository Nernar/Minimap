let pool;

function createPool() {
	if (pool != null) {
		pool.shutdownNow();
	}
	pool = java.util.concurrent.Executors.newScheduledThreadPool(settings.threadCount);
	pool.setKeepAliveTime(60, java.util.concurrent.TimeUnit.SECONDS);
	pool.allowCoreThreadTimeOut(true);
}
