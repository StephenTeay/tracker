import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { exerciseOptions, fetchData, searchYouTubeVideos } from '../utils/fetchData';
import Detail from '../components/Detail';
import ExerciseVideos from '../components/ExerciseVideos';
import SimilarExercises from '../components/SimilarExercises';

const ExerciseDetail = () => {
  const [exerciseDetail, setExerciseDetail] = useState({});
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [targetMuscleExercises, setTargetMuscleExercises] = useState([]);
  const [equipmentExercises, setEquipmentExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Helper function to add delay between requests
  const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchExercisesData = async () => {
      try {
        setLoading(true);
        const exerciseDbUrl = 'https://exercisedb.p.rapidapi.com';

        // 1. Fetch exercise detail first
        const exerciseDetailData = await fetchData(`${exerciseDbUrl}/exercises/exercise/${id}`, exerciseOptions);
        setExerciseDetail(exerciseDetailData);

        // Add delay to prevent rate limiting
        await delay(500);

        // 2. Fetch YouTube videos using YouTube Data API v3
        try {
          console.log('Searching YouTube for:', exerciseDetailData.name);
          const youtubeData = await searchYouTubeVideos(exerciseDetailData.name, 6);
          setExerciseVideos(youtubeData.contents || []);
          console.log('YouTube videos found:', youtubeData.contents?.length || 0);
        } catch (videoError) {
          console.log('YouTube API failed:', videoError.message);
          setExerciseVideos([]);
        }

        await delay(500);

        // 3. Fetch target muscle exercises
        const targetMuscleExercisesData = await fetchData(`${exerciseDbUrl}/exercises/target/${exerciseDetailData.target}`, exerciseOptions);
        setTargetMuscleExercises(targetMuscleExercisesData);

        await delay(500);

        // 4. Fetch equipment exercises
        const equipmentExercisesData = await fetchData(`${exerciseDbUrl}/exercises/equipment/${exerciseDetailData.equipment}`, exerciseOptions);
        setEquipmentExercises(equipmentExercisesData);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load exercise data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercisesData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!exerciseDetail || !exerciseDetail.name) return <div>No Data</div>;

  return (
    <Box sx={{ mt: { lg: '96px', xs: '60px' } }}>
      <Detail exerciseDetail={exerciseDetail} />
      <ExerciseVideos exerciseVideos={exerciseVideos} name={exerciseDetail.name} />
      <SimilarExercises targetMuscleExercises={targetMuscleExercises} equipmentExercises={equipmentExercises} />
    </Box>
  );
};

export default ExerciseDetail;
