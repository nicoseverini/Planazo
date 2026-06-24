import { useState, useRef, useEffect } from 'react'

type AutocompleteProps = {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	suggestions: string[]
	required?: boolean
}

export function Autocomplete({ value, onChange, placeholder, suggestions, required }: AutocompleteProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const filteredSuggestions = suggestions.filter((s) =>
		s.toLowerCase().includes(value.toLowerCase())
	).slice(0, 10)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) return

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
		} else if (e.key === 'Enter' && highlightedIndex >= 0) {
			e.preventDefault()
			onChange(filteredSuggestions[highlightedIndex])
			setIsOpen(false)
			setHighlightedIndex(-1)
		} else if (e.key === 'Escape') {
			setIsOpen(false)
			setHighlightedIndex(-1)
		}
	}

	return (
		<div className="autocomplete" ref={containerRef}>
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => {
					onChange(e.target.value)
					setIsOpen(true)
					setHighlightedIndex(-1)
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				required={required}
				className="autocomplete-input"
			/>
			{isOpen && filteredSuggestions.length > 0 && value && (
				<ul className="autocomplete-suggestions">
					{filteredSuggestions.map((suggestion, index) => (
						<li
							key={suggestion}
							className={`autocomplete-suggestion ${index === highlightedIndex ? 'highlighted' : ''}`}
							onClick={() => {
								onChange(suggestion)
								setIsOpen(false)
								setHighlightedIndex(-1)
								inputRef.current?.focus()
							}}
							onMouseEnter={() => setHighlightedIndex(index)}
						>
							{suggestion}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
