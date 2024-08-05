'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography } from '@mui/material';

const RecipesPage = () => {
  const searchParams = useSearchParams();
  const [recipeList, setRecipeList] = useState("");

  useEffect(() => {
    const recipes = searchParams.get('recipes');
    if (recipes) {
      setRecipeList(decodeURIComponent(recipes));
    }
  }, [searchParams]);

  return (
    <div>
      <Typography>{recipeList}</Typography>
    </div>
  );
};

export default RecipesPage;
