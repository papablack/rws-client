const TimingUtils = {
  LOGGING: true,
  TIMER_ON: true,

  timeLog(...obj) {
    if (!this.LOGGING || !this.TIMER_ON) {
      return;
    }
    obj = [chalk.blueBright('[TIMING]'), ...obj];
    console.log(...obj);
  },

  timingCounterStart() {
    if (!this.TIMER_ON) {
      return;
    }
    rwsRuntimeHelper.startExecTimeRecord();
  },

  timingCounterStop() {
    if (!this.TIMER_ON) {
      return 0;
    }
    return rwsRuntimeHelper.startExecTimeRecord() || 0;
  },

  timingStart(section) {
    if (!this.TIMER_ON) {
      return;
    }
    this.timingCounterStart();
    this.timeLog(`Started timing "${chalk.yellow(section)}"`);
  },

  timingStop(section) {
    if (!this.TIMER_ON) {
      return 0;
    }
    const endTime = this.timingCounterStop();
    this.timeLog(`Stopped timing "${chalk.yellow(section)}" @${endTime}ms`);
    return endTime;
  },

  toggleLogging(val) {
    this.LOGGING = val;
  },

  toggleTimer(val) {
    this.TIMER_ON = val;
  }
};

module.exports = TimingUtils;