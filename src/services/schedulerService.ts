/**
 * Task Scheduling Service
 * 
 * Provides a scheduling mechanism for running periodic tasks in the browser extension.
 * Uses setInterval for task execution and maintains a queue of tasks that need to be
 * executed at regular intervals. Automatically starts when the module is loaded.
 */

/**
 * Singleton service for managing and executing scheduled tasks.
 * Executes tasks at regular intervals using setInterval.
 */
export default class SchedulerService {
  /** Array to hold tasks to be executed */
  private tasks: Array<() => any> = [];

  /** Interval for executing tasks (in milliseconds) */
  private schedulerInterval: number = 1000;

  /** Singleton instance */
  private static instance: SchedulerService;

  private constructor() { }

  /**
   * Get the singleton instance of the scheduler service.
   * @returns The SchedulerService instance
   */
  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Add a task to the scheduler queue.
   * @param task - The callback function to be executed periodically
   * @returns The position of the task in the queue (1-based index)
   */
  public addTask(task: () => any): number {
    return this.tasks.push(task);
  }

  /**
   * Start the scheduler to execute tasks at regular intervals.
   * Uses setInterval to repeatedly execute all queued tasks.
   */
  public run(): void {
    setInterval(() => {
      if (this.tasks.length > 0) {
        for (const task of this.tasks) {
          try {
            task(); // Execute the task
          } catch (error) {
            console.error('Error executing task:', error);
          }
        };
      }
    }, this.schedulerInterval);
  }
}

// Start the scheduler when the module is loaded
SchedulerService.getInstance().run();