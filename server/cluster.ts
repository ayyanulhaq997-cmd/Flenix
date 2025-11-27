import cluster from "cluster";
import os from "os";
import { log } from "./index";

const numCPUs = parseInt(process.env.CLUSTER_WORKERS || String(os.cpus().length), 10);

export function setupCluster() {
  if (cluster.isPrimary && process.env.NODE_ENV === "production") {
    log(`🚀 Primary process ${process.pid} starting ${numCPUs} workers`, "cluster");

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      log(
        `❌ Worker ${worker.process.pid} died (${signal || code}). Restarting...`,
        "cluster"
      );
      cluster.fork();
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      log("🛑 SIGTERM received. Shutting down gracefully...", "cluster");
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
      process.exit(0);
    });
  }
}
