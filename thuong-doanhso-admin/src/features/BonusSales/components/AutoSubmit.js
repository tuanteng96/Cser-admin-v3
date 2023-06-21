import {
    useEffect
} from 'react'
import PropTypes from 'prop-types'

function AutoSubmit({
    values,
    submitForm,
    initialValues
}) {
    useEffect(() => {
        let timerAwait = setTimeout(() => {
            if (values !== initialValues) {
                submitForm();
            }
        }, 500);
        return () => {
            clearTimeout(timerAwait);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values, submitForm])

    return null
}

AutoSubmit.propTypes = {
    values: PropTypes.object,
    submitForm: PropTypes.func
}

export default AutoSubmit;