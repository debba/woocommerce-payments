// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE

import * as Js_dict from "bs-platform/lib/es6/js_dict.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";

function updateCharge(state, id, data) {
  var s = Js_dict.get(state, id);
  var currentCharge = s !== undefined ? s : ({
        data: undefined,
        error: undefined
      });
  state[id] = {
    data: data,
    error: currentCharge.error
  };
  return state;
}

function updateChargeError(state, id, error) {
  var s = Js_dict.get(state, id);
  var currentCharge = s !== undefined ? s : ({
        data: undefined,
        error: undefined
      });
  state[id] = {
    data: currentCharge.data,
    error: error
  };
  return state;
}

function getState(state) {
  if (state !== undefined) {
    return Caml_option.valFromOption(state);
  } else {
    return Js_dict.fromList(/* [] */0);
  }
}

function receiveCharges(state, $$event) {
  console.log($$event);
  var match = $$event.type;
  switch (match) {
    case "SET_CHARGE" :
        return updateCharge(getState(state), $$event.id, $$event.data);
    case "SET_ERROR_FOR_CHARGE" :
        return updateChargeError(getState(state), $$event.id, $$event.error);
    default:
      return getState(state);
  }
}

export {
  updateCharge ,
  updateChargeError ,
  getState ,
  receiveCharges ,
  
}
/* No side effect */
