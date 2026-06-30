export default function wildCardSearch(
    list: Array<Record<string, unknown>>,
    input: string,
    specifyKey?: string,
) {
    const searchText = (item: Record<string, unknown>) => {
        if (specifyKey) {
            // Se uma chave específica for definida, buscar apenas nela
            const value = item[specifyKey]
            if (value == null) return false
            return (
                String(value)
                    .toUpperCase()
                    .indexOf(input.toString().toUpperCase()) !== -1
            )
        }

        // Se nenhuma chave for especificada, buscar em campos string/number
        for (const key in item) {
            const value = item[key]
            if (value == null) continue

            // Apenas processar strings e números
            if (
                typeof value === 'string' ||
                typeof value === 'number'
            ) {
                if (
                    String(value)
                        .toUpperCase()
                        .indexOf(input.toString().toUpperCase()) !== -1
                ) {
                    return true
                }
            }
        }
        return false
    }
    const result = list.filter((value) => searchText(value))
    return result
}
