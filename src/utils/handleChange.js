export const createHandleChange = (setState) => {
    return function (event){
        const { name, value, type, checked } = event.target
        setState(prev => {
            return {
                ...prev,
                [name] : type === "checkbox" ? checked : value
            }
        })
    }
}