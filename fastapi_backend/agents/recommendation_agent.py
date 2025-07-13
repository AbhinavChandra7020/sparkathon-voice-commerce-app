from groq import Groq
import json
from typing import List, Dict, Any
from pydantic import BaseModel
import os
from dataclasses import dataclass

json_data = {}
with open("product_data.json") as json_file:
    json_data = json.load(json_file)

@dataclass
class Product:
    ProductID: str
    ProductTitle: str
    ProductDescription: str
    ProductCategory: str
    Brand: str
    Price: float
    ProductImg: str = ""

SAMPLE_PRODUCTS = [
    Product(
        ProductID=p["ProductID"],
        ProductTitle=p["ProductTitle"],
        ProductDescription=p["ProductDescription"],
        ProductCategory=p["ProductCategory"],
        Brand=p["Brand"],
        Price=p["Price"],
        ProductImg=p["ProductImg"]
    )
    for p in json_data["products"]
]

class ProductMatchResponse(BaseModel):
    matched_products: List[str]  # List of ProductIDs
    reasoning: str
    confidence_score: float

class ProductAgent:
    def __init__(self, groq_api_key: str = None):
        """
        Initialize the ProductAgent with Groq API key
        
        Args:
            groq_api_key: Groq API key. If None, will try to get from environment variable GROQ_API_KEY
        """
        if groq_api_key is None:
            groq_api_key = os.getenv("GROQ_API_KEY")
        
        if not groq_api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable or pass it directly.")
        
        self.client = Groq(api_key=groq_api_key)
        self.model = "llama3-70b-8192"  # You can change this to other available models
    
    def find_matching_products(self, customer_requirements: str) -> ProductMatchResponse:
        """
        Find products that match customer requirements using Groq LLM
        
        Args:
            customer_requirements: Text containing what the customer is looking for
            products: List of available products
            
        Returns:
            ProductMatchResponse containing matched ProductIDs and reasoning
        """
        
        # Convert products to a formatted string for the prompt
        products_info = self._format_products_for_prompt(SAMPLE_PRODUCTS)
        
        system_prompt = """You are a helpful shopping assistant AI. Your task is to analyze customer requirements and match them with available products from a database.

Instructions:
1. Carefully analyze the customer's requirements
2. Compare them against the available products
3. Consider factors like ProductCategory, Brand preferences, Price range, and specific features mentioned
4. Return ONLY the ProductIDs of products that closely match the requirements
5. Provide clear reasoning for your selections
6. Assign a confidence score (0.0 to 1.0) based on how well the products match

Important:
- Only return ProductIDs that exist in the provided product list
- If no products match well, return an empty list
- Consider synonyms and related terms (e.g., "phone" could match "smartphone")
- Pay attention to price constraints if mentioned
- Consider brand preferences if specified
- Match categories: Electronics, Clothing, Beauty, Books, Grocery

Response format should be valid JSON with this structure:
{
    "matched_products": ["ProductID1", "ProductID2"],
    "reasoning": "Explanation of why these products were selected",
    "confidence_score": 0.85
}"""

        user_prompt = f"""
Customer Requirements: "{customer_requirements}"

Available Products:
{products_info}

Please analyze the customer requirements and return the matching ProductIDs in the specified JSON format.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent results
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                result_json = json.loads(response_text)
                return ProductMatchResponse(
                    matched_products=result_json.get("matched_products", []),
                    reasoning=result_json.get("reasoning", ""),
                    confidence_score=result_json.get("confidence_score", 0.0)
                )
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract information manually
                return self._fallback_parse_response(response_text, SAMPLE_PRODUCTS)
                
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return ProductMatchResponse(
                matched_products=[],
                reasoning=f"Error processing request: {str(e)}",
                confidence_score=0.0
            )
    
    def _format_products_for_prompt(self, products: List[Product]) -> str:
        """Format products information for the LLM prompt"""
        formatted = []
        for product in products:
            formatted.append(f"""
ProductID: {product.ProductID}
Title: {product.ProductTitle}
Description: {product.ProductDescription}
Category: {product.ProductCategory}
Brand: {product.Brand}
Price: ${product.Price:.2f}
---""")
        return "\n".join(formatted)
    
    def _fallback_parse_response(self, response_text: str, products: List[Product]) -> ProductMatchResponse:
        """Fallback parser if JSON parsing fails"""
        # Extract ProductIDs that appear in the response
        product_ids = [p.ProductID for p in products]
        matched_ids = [pid for pid in product_ids if pid in response_text]
        
        return ProductMatchResponse(
            matched_products=matched_ids,
            reasoning="Fallback parsing - JSON response format was invalid",
            confidence_score=0.5
        )