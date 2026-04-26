'use client'

import Link from "next/link"
import { useParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import { useSearchParams, useRouter } from "next/navigation"
import { postFetcher, fetcher } from "@/app/lib/data"

export function Question({question, answer, onDelete}){
    let [isExpanded, setIsExpanded] = useState(false);
    
    return(
        <div className={`border border-gray-200 p-4 rounded-lg transition-all duration-200 ${
            isExpanded ? 'border-primary/50 bg-primary/5' : 'hover:border-gray-300'
        }`}>
            <div className="flex justify-between items-start">
                <button 
                    className="flex-1 text-left font-medium text-gray-800 hover:text-primary transition-colors" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {question}
                </button>
                <div className="flex items-center gap-2 ml-4">
                    {onDelete && (
                        <button 
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        >
                            <span className="icon-[fluent--delete-16-filled] w-4 h-4" />
                        </button>
                    )}
                    <span className={`w-5 h-5 transition-transform duration-200 ${
                        isExpanded 
                            ? 'icon-[fluent--chevron-up-16-filled] text-primary' 
                            : 'icon-[fluent--chevron-down-16-filled] text-gray-500'
                    }`}/>
                </div>
            </div>
            <div className={`mt-3 transition-all duration-200 ${
                isExpanded ? 'block opacity-100' : 'hidden opacity-0'
            }`}>
                <p className="text-gray-600 leading-relaxed">{answer}</p>
            </div>
        </div>
    )
}

export default function FAQsPage(){
    const {action} = useParams();
    const { FAQ } = useContext(CreateProductContext);
    let [faqs, setFAQs] = FAQ
    let [question, setQuestion] = useState('')
    let [answer, setAnswer] = useState('');
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const router = useRouter();

    useEffect(()=>{
        if(action === 'edit'){
            fetcher([`/product-faqs/${name}`,{}]).then(data=>{
                // setFAQs(data?.faqs);
            })
        }
    }, [action, name]);

    const addFAQ = () => {
        if (question.trim() && answer.trim()) {
            setFAQs([...faqs, {question: question.trim(), answer: answer.trim()}])
            setQuestion('')
            setAnswer('')
        }
    };

    const deleteFAQ = (index) => {
        setFAQs(faqs.filter((_, i) => i !== index));
    };

    const submit = async () => {
        router.push(`/admin/products/${action}/preview${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`);
    };
   
    

    return(
        <div className="space-y-8">
            {/* Existing FAQs Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">Frequently Asked Questions</h5>
                
                {faqs.length > 0 ? (
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <Question 
                                key={i} 
                                question={faq.question} 
                                answer={faq.answer}
                                onDelete={() => deleteFAQ(i)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <span className="icon-[fluent--question-circle-24-regular] w-12 h-12 mx-auto mb-3 block" />
                        <p>No FAQs added yet. Add your first FAQ below.</p>
                    </div>
                )}
            </section>

            {/* Add New FAQ Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">Add New FAQ</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                        <input 
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                            placeholder="Enter your question..." 
                            type="text" 
                            value={question} 
                            onChange={e=>setQuestion(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                        <textarea 
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" 
                            placeholder="Provide a detailed answer..." 
                            rows={4}
                            value={answer} 
                            onChange={e=>setAnswer(e.target.value)}
                        />
                    </div>
                    <button 
                        className="bg-secondary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={addFAQ}
                        disabled={!question.trim() || !answer.trim()}
                    >
                        <span className="icon-[fluent--add-16-filled] w-4 h-4" />
                        Add FAQ
                    </button>
                </div>
            </section>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Link 
                    href={`/admin/products/${action}/details${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`} 
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    <span className="icon-[fluent--arrow-left-16-filled] w-4 h-4" />
                    Back
                </Link>
                <button 
                    onClick={submit}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    Continue to Publishing
                    <span className="icon-[fluent--arrow-right-16-filled] w-4 h-4" />
                </button>
            </div>
        </div>
    )
}