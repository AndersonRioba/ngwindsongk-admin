'use client'
import RecipeForm from "../RecipeForm"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function CreateRecipePage() {
    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="my-8">
                <h2 className="text-3xl font-bold">Create New Recipe</h2>
                <p className="text-gray-400 mt-1">Share your culinary expertise with the world</p>
            </div>
            <RecipeForm />
        </main>
    )
}
