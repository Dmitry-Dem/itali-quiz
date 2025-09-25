import { describe, it, expect } from 'vitest'

describe('Bulk Import - New Format Parser', () => {
  const parseBulkText = (text: string) => {
    const trimmedText = text.trim()
    if (!trimmedText) return []
    
    const parsed: Array<{ italian: string; english: string; details?: string }> = []
    const regex = /\[([^\]]+)\]\[([^\]]+)\](?:\[([^\]]*)\])?/g
    
    let match
    while ((match = regex.exec(trimmedText)) !== null) {
      const italian = match[1].trim()
      const english = match[2].trim()
      const details = match[3] ? match[3].trim() : undefined
      
      if (italian && english) {
        parsed.push({ 
          italian, 
          english, 
          details: details || undefined 
        })
      }
    }
    
    return parsed
  }

  it('should parse comma-separated bracket format correctly', () => {
    const testInput = `[ciao][hello][greeting], [grazie][thank you][expression of gratitude], [casa][house][building where people live], [acqua][water]`
    
    const result = parseBulkText(testInput)
    
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({
      italian: 'ciao',
      english: 'hello',
      details: 'greeting'
    })
    expect(result[1]).toEqual({
      italian: 'grazie',
      english: 'thank you',
      details: 'expression of gratitude'
    })
    expect(result[2]).toEqual({
      italian: 'casa',
      english: 'house',
      details: 'building where people live'
    })
    expect(result[3]).toEqual({
      italian: 'acqua',
      english: 'water',
      details: undefined
    })
  })

  it('should handle words without description in comma-separated format', () => {
    const testInput = `[ciao][hello], [grazie][thank you][], [casa][house][description]`
    
    const result = parseBulkText(testInput)
    
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      italian: 'ciao',
      english: 'hello',
      details: undefined
    })
    expect(result[1]).toEqual({
      italian: 'grazie',
      english: 'thank you',
      details: undefined
    })
    expect(result[2]).toEqual({
      italian: 'casa',
      english: 'house',
      details: 'description'
    })
  })

  it('should handle malformed bracket format gracefully', () => {
    const testInput = `[ciao][hello][greeting], malformed text, [incomplete][bracket], [good][example][description], [][]empty brackets, [only-one-bracket, [two][brackets][three]`
    
    const result = parseBulkText(testInput)
    
    // The regex will find valid bracket patterns even in malformed text
    expect(result).toHaveLength(4)
    expect(result[0].italian).toBe('ciao')
    expect(result[0].english).toBe('hello')
    expect(result[0].details).toBe('greeting')
    expect(result[1].italian).toBe('incomplete')
    expect(result[1].english).toBe('bracket')
    expect(result[1].details).toBe(undefined)
    expect(result[2].italian).toBe('good')
    expect(result[2].english).toBe('example')
    expect(result[2].details).toBe('description')
    // This pattern gets matched from the malformed text: [only-one-bracket, [two][brackets][three]
    expect(result[3].italian).toBe('only-one-bracket, [two')
    expect(result[3].english).toBe('brackets')
    expect(result[3].details).toBe('three')
  })

  it('should handle complex descriptions with special characters', () => {
    const testInput = `[café][coffee][hot drink, popular in Italy], [così][so][adverb: in this way, like this], [perché][why/because][question word or conjunction]`
    
    const result = parseBulkText(testInput)
    
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      italian: 'café',
      english: 'coffee',
      details: 'hot drink, popular in Italy'
    })
    expect(result[1]).toEqual({
      italian: 'così',
      english: 'so',
      details: 'adverb: in this way, like this'
    })
    expect(result[2]).toEqual({
      italian: 'perché',
      english: 'why/because',
      details: 'question word or conjunction'
    })
  })

  it('should handle multiline input with commas', () => {
    const testInput = `[ciao][hello][greeting], [grazie][thank you],
    
    [casa][house], [acqua][water][liquid]`
    
    const result = parseBulkText(testInput)
    
    expect(result).toHaveLength(4)
    expect(result[0].italian).toBe('ciao')
    expect(result[1].italian).toBe('grazie')
    expect(result[2].italian).toBe('casa')
    expect(result[3].italian).toBe('acqua')
  })
})