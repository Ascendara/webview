'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CodeInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
  error?: boolean
}

export function CodeInput({ length = 6, onComplete, disabled = false, error = false }: CodeInputProps) {
  const [values, setValues] = React.useState<string[]>(Array(length).fill(''))
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    console.log('[CodeInput] Component mounted, focusing first input')
    inputRefs.current[0]?.focus()
  }, [])

  React.useEffect(() => {
    console.log('[CodeInput] Current values:', values)
    console.log('[CodeInput] Filled count:', values.filter(v => v !== '').length)
  }, [values])

  const handleChange = (index: number, value: string) => {
    console.log(`[CodeInput] handleChange called - index: ${index}, value: "${value}"`)
    
    if (disabled) {
      console.log('[CodeInput] Input is disabled, ignoring change')
      return
    }

    const digit = value.replace(/\D/g, '').slice(-1)
    console.log(`[CodeInput] Extracted digit: "${digit}"`)
    
    const newValues = [...values]
    newValues[index] = digit
    console.log('[CodeInput] New values array:', newValues)

    setValues(newValues)

    if (digit && index < length - 1) {
      console.log(`[CodeInput] Moving focus to input ${index + 1}`)
      inputRefs.current[index + 1]?.focus()
    }

    const allFilled = newValues.every(v => v !== '')
    console.log('[CodeInput] All inputs filled:', allFilled)
    
    if (allFilled) {
      const code = newValues.join('')
      console.log('[CodeInput] Calling onComplete with code:', code)
      onComplete(code)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(`[CodeInput] Key pressed: ${e.key} at index ${index}`)
    
    if (disabled) {
      console.log('[CodeInput] Input is disabled, ignoring keydown')
      return
    }

    if (e.key === 'Backspace') {
      console.log('[CodeInput] Backspace pressed')
      e.preventDefault()
      const newValues = [...values]
      
      if (values[index]) {
        console.log(`[CodeInput] Clearing current input at index ${index}`)
        newValues[index] = ''
        setValues(newValues)
      } else if (index > 0) {
        console.log(`[CodeInput] Moving back to index ${index - 1} and clearing`)
        newValues[index - 1] = ''
        setValues(newValues)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      console.log(`[CodeInput] Moving focus left to index ${index - 1}`)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      console.log(`[CodeInput] Moving focus right to index ${index + 1}`)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    console.log('[CodeInput] Paste event triggered')
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    console.log('[CodeInput] Pasted data (digits only):', pastedData)
    
    const newValues = pastedData.split('').concat(Array(length).fill('')).slice(0, length)
    console.log('[CodeInput] New values from paste:', newValues)
    setValues(newValues)

    const allFilled = newValues.every(v => v !== '')
    console.log('[CodeInput] All inputs filled after paste:', allFilled)
    
    if (allFilled) {
      const code = newValues.join('')
      console.log('[CodeInput] Calling onComplete with pasted code:', code)
      onComplete(code)
    }

    const nextEmptyIndex = newValues.findIndex(v => v === '')
    if (nextEmptyIndex !== -1) {
      console.log(`[CodeInput] Focusing next empty input at index ${nextEmptyIndex}`)
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      console.log('[CodeInput] All filled, focusing last input')
      inputRefs.current[length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold',
            error && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
