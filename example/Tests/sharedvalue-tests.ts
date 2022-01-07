import {Worklets} from 'react-native-worklets';
import {Test} from './types';
import {Expect, ExpectException, ExpectValue} from './utils';

const get_set_numeric_value: Test = () => {
  const sharedValue = Worklets.createSharedValue(100);
  sharedValue.value = 50;
  return ExpectValue(sharedValue.value, 50);
};

const get_set_bool_value: Test = () => {
  const sharedValue = Worklets.createSharedValue(true);
  sharedValue.value = false;
  return ExpectValue(sharedValue.value, false);
};

const get_set_string_value: Test = () => {
  const sharedValue = Worklets.createSharedValue('hello world');
  sharedValue.value = 'hello worklet';
  return ExpectValue(sharedValue.value, 'hello worklet');
};

const get_set_object_value: Test = () => {
  const sharedValue = Worklets.createSharedValue({a: 100, b: 200});
  sharedValue.value.a = 50;
  sharedValue.value.b = 100;
  return ExpectValue(sharedValue.value, {a: 50, b: 100});
};

const get_set_array_value: Test = () => {
  const sharedValue = Worklets.createSharedValue([100, 50]);
  return ExpectValue(sharedValue.value[0], 100).then(() =>
    ExpectValue(sharedValue.value[1], 50),
  );
};

const array_length: Test = () => {
  const sharedValue = Worklets.createSharedValue([100, 50]);
  return ExpectValue(sharedValue.value.length, 2);
};

const set_value_from_worklet: Test = () => {
  const sharedValue = Worklets.createSharedValue('hello world');
  const worklet = Worklets.createWorklet(
    function () {
      this.sharedValue.value = 'hello worklet';
    },
    {sharedValue},
  );
  sharedValue.value = 'hello worklet';
  return Expect(worklet.callInWorkletContext, () =>
    sharedValue.value === 'hello worklet'
      ? undefined
      : `Expected ${"'hello worklet'"} but got ${sharedValue.value}`,
  );
};

const set_function_with_error: Test = () => {
  return ExpectException(() => {
    Worklets.createSharedValue(() => {});
  }, 'Regular javascript functions can not be passed to worklets.');
};

const add_listener: Test = () => {
  const sharedValue = Worklets.createSharedValue(100);
  const didChange = Worklets.createSharedValue(false);
  const unsubscribe = sharedValue.addListener(() => (didChange.value = true));
  sharedValue.value = 50;
  unsubscribe();
  console.log(didChange.value);
  return ExpectValue(didChange.value, true);
};

const add_listener_from_worklet_should_fail: Test = () => {
  const sharedValue = Worklets.createSharedValue(100);
  const worklet = Worklets.createWorklet(
    function () {
      this.sharedValue.addListener(() => {});
    },
    {sharedValue},
  );
  return ExpectException(
    worklet.callInWorkletContext,
    'addListener can only be called from the main Javascript context and not from a worklet.',
  );
};

export const sharedvalue_tests: {[key: string]: Test} = {
  get_set_numeric_value,
  get_set_bool_value,
  get_set_string_value,
  get_set_object_value,
  get_set_array_value,
  array_length,
  set_value_from_worklet,
  set_function_with_error,
  add_listener,
  add_listener_from_worklet_should_fail,
};
