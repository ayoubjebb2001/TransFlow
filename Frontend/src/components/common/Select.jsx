const Select = ({
    label,
    error,
    options = [],
    placeholder,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-300 focus:ring-blue-500/50'
                    }`}
                {...props}
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Select;
