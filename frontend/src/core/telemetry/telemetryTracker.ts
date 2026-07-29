/**
 * Módulo de Telemetría para Frontend
 * Registra tiempos de renderizado y latencias de checkout POS
 */

export class TelemetryTracker {
  private static marks: Record<string, number> = {};

  public static start(label: string) {
    this.marks[label] = performance.now();
  }

  public static end(label: string) {
    if (this.marks[label]) {
      const duration = performance.now() - this.marks[label];
      console.log(`⏱️ [Telemetría FE] ${label}: ${duration.toFixed(2)} ms`);
      delete this.marks[label];
      return duration;
    }
    return 0;
  }
}
