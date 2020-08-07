import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'

export const GameBoardPage = () => {

    const fetchData = async () => {
        const words = await wordService.fetchAll()
        setWords(words)
        const letters = [
            ['A', 'I', 'S', 'T', 'I', 'O', 'S', 'U', 'M', 'L'],
            ['L', 'Ä', 'E', 'F', 'O', 'K', 'L', 'P', 'Y', 'P'],
            ['A', 'B', 'T', 'E', 'R', 'I', 'J', 'N', 'I', 'E'],
            ['A', 'I', 'S', 'T', 'I', 'O', 'V', 'U', 'M', 'A'],
            ['L', 'Ä', 'E', 'F', 'O', 'K', 'O', 'P', 'Y', 'O'],
            ['A', 'B', 'V', 'U', 'R', 'I', 'M', 'N', 'I', 'S'],
            ['E', 'I', 'S', 'G', 'K', 'O', 'S', 'U', 'M', 'F'],
            ['K', 'A', 'O', 'F', 'O', 'K', 'I', 'P', 'Y', 'Ö'],
            ['R', 'E', 'K', 'D', 'R', 'I', 'K', 'N', 'I', 'L'],
            ['A', 'B', 'T', 'E', 'R', 'I', 'K', 'O', 'L', 'E'],
            ['A', 'S', 'S', 'T', 'E', 'O', 'V', 'U', 'M', 'A'],
            ['L', 'Ä', 'E', 'F', 'O', 'K', 'O', 'P', 'Y', 'O'],
        ]
        setLetters(letters)
      }

      useEffect(() => {
          console.log("lul")
        fetchData()
      }, [])


    const [words, setWords] = useState<string[] | undefined>(undefined);
    const [letters, setLetters] = useState<string[][]>([])

        return  <div>
                    <div>
                        <h1>GameBoardPage</h1>
                    </div>
                    <div>
                        <Board letters={letters} /> 
                    </div> 
                </div>;
    }