import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import DatePicker, { registerLocale } from 'react-datepicker'
import Portal from 'react-overlays/cjs/Portal'
import vi from "date-fns/locale/vi";

const CalendarContainer = ({ children }) => {
  const el = document.getElementById('calendar-portal')

  return <Portal container={el}>{children}</Portal>
}

const InputDatePicker = ({ errorMessage, errorMessageForce, ...props }) => {
  return (
    <>
      <div className="relative">
        <DatePicker
          locale={vi}
          className={clsx(
            "w-full px-3 py-3 transition bg-white border rounded outline-none disabled:bg-gray-200 disabled:border-gray-200",
            errorMessageForce
              ? "border-danger"
              : "border-gray-300 dark:border-graydark-400 focus:border-primary dark:focus:border-primary"
          )}
          popperContainer={CalendarContainer}
          timeIntervals={5}
          {...props}
        />
        {errorMessageForce && (
          <div className="absolute top-0 right-0 flex items-center w-10 h-full pointer-events-none">
            <ExclamationCircleIcon className="w-6 text-danger" />
          </div>
        )}
      </div>
      {errorMessage && errorMessageForce && (
        <div className="mt-1.5 text-sm text-danger">{errorMessage}</div>
      )}
    </>
  );
}

export { InputDatePicker }
