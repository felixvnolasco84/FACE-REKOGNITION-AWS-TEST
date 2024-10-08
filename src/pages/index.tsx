import { Rekognition } from 'aws-sdk';
import type { NextPage } from 'next';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const [bestMatchImages, setBestMatchImages] = useState<
    (string | undefined)[]
  >([]);
  const [matchResult, setMatchResult] = useState<Rekognition.FaceMatchList>();
  console.log(matchResult);
  const hello = trpc.useQuery(['hello', { text: 'client' }]);
  const indexFace = trpc.useMutation('indexFace');
  const searchFaceByImage = trpc.useMutation('searchFaceByImage');
  const handleIndexFace = useCallback(() => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    if (imageSrc) {
      indexFace.mutate({ image: imageSrc });
    }
  }, [webcamRef]);
  const handleSearchFace = useCallback(async () => {
    const imageSrc = webcamRef?.current?.getScreenshot();

    console.log(imageSrc);
    if (imageSrc) {
      await searchFaceByImage.mutate(
        { image: imageSrc },
        {
          onSuccess(data) {
            console.log(data);
            setMatchResult(data.matchedFaces);
            setBestMatchImages(data.images ?? []);
          },
        }
      );
    }
  }, [webcamRef]);
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-4">
      <div className="flex justify-center">
        <div className="grid gap-12">
          <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-md">
            <img src="https://www.polygonag.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpolygonplus.5a2b1457.png&w=1920&q=75"></img>
          </div>

          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl"
          />
          <div className="mb-2" />
          <div className="text-center">
            {/* styled tailwind button */}
            <button
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleIndexFace}
            >
              Capturar Rostro
            </button>
            <div className="mr-2 inline" />
            <button
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleSearchFace}
            >
              Buscar Similitudes
            </button>
          </div>
        </div>
      </div>

      {bestMatchImages.length > 0 &&
        bestMatchImages.map((image, index) => (
          <div key={index} className="mt-6 flex items-center justify-center">
            <div>
              <img
                className="h-64 w-64 rounded-md object-cover"
                src={'data:image/jpeg;base64,' + image}
                alt="best match"
              />
            </div>
            <div className="mr-4" />
            <div>
              {matchResult && (
                <div>
                  <div>Similarity</div>
                  <div className="text-4xl">
                    {matchResult[index]?.Similarity?.toFixed(6)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Home;
