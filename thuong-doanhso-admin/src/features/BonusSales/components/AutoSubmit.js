import { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { omit, isEqual } from 'lodash-es'

const AutoSubmit = ({ delay = 500, submitForm, values, errors, initialValues }) => {
  
    const isSameValueAsInitialValue = async (v) =>
      isEqual(v, initialValues);
  
    const onFormSubmit = useCallback(async () => {
      const v = omit(values, Object.keys(errors));
      if (submitForm && !(await isSameValueAsInitialValue(v))) submitForm(v);
    }, [values, initialValues, errors]);
  
    // add delay of 300ms by default, or whatever delay prop is
    useEffect(() => {
      const timer = setTimeout(() => onFormSubmit(), delay);
      return () => clearTimeout(timer);
    }, [values, errors]);
  
    return null;
  };

// function AutoSubmit({ values, submitForm, initialValues, setLoading }) {
//   useEffect(() => {
//     let timerAwait = null;
//     setTimeout(() => {
//       if (values !== initialValues) {
//         submitForm();
//       }
//     }, 500);
//     return () => {
//       clearTimeout(timerAwait);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [values, submitForm]);

//   return null;
// }

AutoSubmit.propTypes = {
  values: PropTypes.object,
  submitForm: PropTypes.func,
};

export default AutoSubmit;
