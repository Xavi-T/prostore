import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prisma object into a regular Js object
export function convertToPlainObject<T>(data: T) {
  return JSON.parse(JSON.stringify(data))
}

// format number with decimal places
export function formatNUmberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`
}

// format error
export async function formatErrorMessage(error: any) {
  if (error.name === 'ZodError') {
    // handle zod error
    const filedErrors = Object.keys(error.errors).map((fields) => {
      return error.errors[fields].message
    })
    return filedErrors.join('. ')
  } else if (
    error.name == 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // handle prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field'

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  } else {
    // handle other errors

    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message)
  }
}

// round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100
  } else {
    throw new Error('Value must be a number or string!')
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2
})

// format number to currency use CURRENCY_FORMATTER
export function formatCurrency(value: number | string | null) {
  if (typeof value === 'number') {
    return CURRENCY_FORMATTER.format(value)
  } else if (typeof value === 'string') {
    return CURRENCY_FORMATTER.format(Number(value))
  } else {
    return 'NaN'
  }
}
