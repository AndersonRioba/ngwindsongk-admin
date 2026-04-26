'use client'
import { useParams } from "next/navigation"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import RecipeForm from "../../RecipeForm"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import Spinner from "@/app/UI/Spinner"

export default function EditRecipePage() {
    const { id } = useParams();
    
    const { data: recipeData, error, isLoading } = useSWR([`/admin/recipes/${id}`, {}], fetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true
    });

    const recipe = recipeData?.recipe || recipeData?.data || recipeData;

    if (isLoading) return <Spinner full={true} />;
    if (error) return <div className="p-10 text-Error">Error loading recipe data</div>;

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="my-8">
                <h2 className="text-3xl font-bold">Edit Recipe</h2>
                <p className="text-gray-400 mt-1">Modifying: <span className="text-primary font-bold italic">{recipe?.title}</span></p>
            </div>
            <RecipeForm initialData={recipe} isEdit={true} />
        </main>
    )
}
