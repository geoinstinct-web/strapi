import set from 'lodash/set';
import persistStateToLocaleStorage, {
  COMPLETED_STEPS,
  CURRENT_STEP,
  SKIPPED,
  VISIBLE,
} from './utils/persistStateToLocaleStorage';

const init = initialState => {
  const copyInitialState = { ...initialState };
  const guidedTourLocaleStorage = persistStateToLocaleStorage.get(COMPLETED_STEPS);
  const currentStepLocaleStorage = persistStateToLocaleStorage.get(CURRENT_STEP);
  const skippedLocaleStorage = persistStateToLocaleStorage.get(SKIPPED);
  const isVisibleLocaleStorage = persistStateToLocaleStorage.get(VISIBLE);

  if (isVisibleLocaleStorage) {
    set(copyInitialState, 'isGuidedTourVisible', true);
  }

  if (guidedTourLocaleStorage) {
    guidedTourLocaleStorage.forEach(step => {
      const [sectionName, stepName] = step.split('.');
      set(copyInitialState, ['guidedTourState', sectionName, stepName], true);
    });
  }

  // if current step when initializing mark it as done
  if (currentStepLocaleStorage) {
    const [sectionName, stepName] = currentStepLocaleStorage.split('.');
    set(copyInitialState, ['guidedTourState', sectionName, stepName], true);
    persistStateToLocaleStorage.addCompletedStep(currentStepLocaleStorage);
    persistStateToLocaleStorage.addCurrentStep(null);
  }

  if (skippedLocaleStorage) {
    set(copyInitialState, 'isSkipped', true);
  }

  return copyInitialState;
};

export default init;
