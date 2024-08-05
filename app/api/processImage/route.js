import { ImageAnnotatorClient } from '@google-cloud/vision';

const credentials = JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_VISION_API);

const client = new ImageAnnotatorClient({
  //keyFilename: 'APIKey.json', // make sure this path is correct relative to the root
  credentials
});

export async function POST(req, res) {
  console.log('Request received:', req.method); // Log the method
  try {
    const { image_url } = await req.json();
    console.log('Image URL received:', image_url); // Log the image URL received
    const [result] = await client.labelDetection(image_url);
    const labels = result.labelAnnotations;
    const descriptions = labels.map(label => label.description);
    const topLabel = descriptions[0];
    console.log('Top Label: ', topLabel[0]); // Log the labels detected
    return new Response(JSON.stringify({ labels: descriptions }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error during label detection:', error); // Log the error
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
