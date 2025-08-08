/* eslint-disable react/prop-types */
import React from 'react'
import classNames from 'utils/classnames'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

type InvisibleInputType = InputProps & {
  label?: string
  hideLabel?: boolean
  labelClassName?: string
  fullWidth?: boolean
}

const InvisibleInput = ({
  label,
  hideLabel = false,
  fullWidth = true,
  labelClassName = '',
  className = '',
  ...props
}: InvisibleInputType) => {
  return (
    <div className={classNames('flex items-center', fullWidth && 'flex-1')}>
      {label && (
        <label
          htmlFor={props.id}
          className={classNames('mr-2', hideLabel && 'sr-only', labelClassName)}
        >
          {label}
        </label>
      )}

      <input
        {...props}
        className={classNames(
          'appearance-none rounded transition relative block w-full px-3 py-2 border border-opacity-0 hover:border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
          className
        )}
      />
    </div>
  )
}

export default InvisibleInput
