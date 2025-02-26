import { NextResponse } from 'next/server';

interface Definition {
  definition: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface DictionaryResponse {
  word: string;
  meanings: Meaning[];
}

export async function GET() {
  try {
    // Fetch random word
    const wordResponse = await fetch('https://random-word-api.herokuapp.com/word');
    const [randomWord] = await wordResponse.json();

    // Fetch definition
    const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
    const definitionData = await definitionResponse.json();

    // If we have a valid definition, return combined data
    if (Array.isArray(definitionData) && definitionData.length > 0) {
      const { word, meanings } = definitionData[0] as DictionaryResponse;
      
      return NextResponse.json({
        word,
        meanings: meanings.map((meaning) => {
          // Get the longest definition for this part of speech
          const longestDefinition = meaning.definitions.reduce((longest, current) => 
            current.definition.length > longest.definition.length ? current : longest
          , meaning.definitions[0]);

          return {
            partOfSpeech: meaning.partOfSpeech,
            definitions: [{
              definition: longestDefinition.definition
            }]
          };
        })
      });
    }

    // If no definition found, return just the word
    return NextResponse.json({
      word: randomWord,
      meanings: []
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word data' },
      { status: 500 }
    );
  }
} 