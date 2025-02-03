import chalk from 'chalk';

interface RWSRuntimeHelper {
  startExecTimeRecord(): number;
}

declare const rwsRuntimeHelper: RWSRuntimeHelper;

export const TimingUtils = {
  LOGGING: true,
  TIMER_ON: true,

  timeLog(...obj: any[]): void {
    if (!this.LOGGING || !this.TIMER_ON) {
      return;
    }
    obj = [chalk.blueBright('[TIMING]'), ...obj];
    console.log(...obj);
  },

  timingCounterStart(): void {
    if (!this.TIMER_ON) {
      return;
    }
    rwsRuntimeHelper.startExecTimeRecord();
  },

  timingCounterStop(): number {
    if (!this.TIMER_ON) {
      return 0;
    }
    return rwsRuntimeHelper.startExecTimeRecord() || 0;
  },

  timingStart(section: string): void {
    if (!this.TIMER_ON) {
      return;
    }
    this.timingCounterStart();
    this.timeLog(`Started timing "${chalk.yellow(section)}"`);
  },

  timingStop(section: string): number {
    if (!this.TIMER_ON) {
      return 0;
    }
    const endTime = this.timingCounterStop();
    this.timeLog(`Stopped timing "${chalk.yellow(section)}" @${endTime}ms`);
    return endTime;
  },

  toggleLogging(val: boolean): void {
    this.LOGGING = val;
  },

  toggleTimer(val: boolean): void {
    this.TIMER_ON = val;
  }
};