import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload as UploadIcon, X, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { ingredientsAPI } from '@/api/ingredients';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function Upload() {
  const [images, setImages] = useState<File[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualIngredient, setManualIngredient] = useState('');
  const navigate = useNavigate();
  
  const {
    detectedIngredients,
    customIngredients,
    setDetectedIngredients,
    addCustomIngredient,
    removeIngredient,
    getAllIngredients,
  } = useIngredientsStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    onDrop: (acceptedFiles) => {
      setImages((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetectIngredients = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsDetecting(true);
    try {
      const response = await ingredientsAPI.detectFromImages(images);
      const ingredientNames = response.detectedIngredients;
      setDetectedIngredients(ingredientNames);
      toast.success(`Detected ${ingredientNames.length} ingredients!`);
      setImages([]); // Clear images after successful detection
    } catch (error: any) {
      const statusCode = error.response?.status;
      if (statusCode === 429) {
        toast.error('Too many requests. Please try again in a moment.');
      } else if (statusCode === 500) {
        toast.error('Server error during ingredient detection. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to detect ingredients');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddManualIngredient = () => {
    if (manualIngredient.trim()) {
      addCustomIngredient(manualIngredient.trim());
      setManualIngredient('');
      toast.success('Ingredient added');
    }
  };

  const handleFindRecipes = () => {
    const allIngredients = getAllIngredients();
    if (allIngredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    navigate('/recipes');
  };

  const handleGetRecommendations = () => {
    const allIngredients = getAllIngredients();
    if (allIngredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    navigate('/recommend', { state: { ingredients: allIngredients } });
  };

  const allIngredients = getAllIngredients();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">
              Upload Your Ingredients
            </h1>
            <p className="text-muted-foreground text-lg">
              Take photos or manually add ingredients to get recipe suggestions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>
                  Drop images or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Drop images here'
                      : 'Drag & drop images, or click to select'}
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleDetectIngredients}
                  disabled={images.length === 0 || isDetecting}
                  className="w-full"
                >
                  {isDetecting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Analyzing images (this may take a few seconds)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Detect Ingredients with AI
                    </>
                  )}
                </Button>
                
                {isDetecting && (
                  <p className="text-xs text-muted-foreground text-center">
                    AI is analyzing your images. This usually takes 5-15 seconds.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ingredients List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Ingredients</CardTitle>
                <CardDescription>
                  {allIngredients.length} ingredients ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ingredient manually"
                    value={manualIngredient}
                    onChange={(e) => setManualIngredient(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddManualIngredient();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddManualIngredient}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {detectedIngredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="flex items-center justify-between p-3 bg-primary/5 rounded-lg"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {ingredient}
                      </span>
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {customIngredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {allIngredients.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No ingredients added yet
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={allIngredients.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get AI Recommendations
                  </Button>
                  
                  <Button
                    onClick={handleFindRecipes}
                    disabled={allIngredients.length === 0}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Browse All Recipes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
