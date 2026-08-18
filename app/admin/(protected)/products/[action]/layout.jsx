import ProductLayoutClient from "./ProductLayoutClient"

export default function CreateLayout({ children }) {
    return (
        <ProductLayoutClient>
            {children}
        </ProductLayoutClient>
    )
}
