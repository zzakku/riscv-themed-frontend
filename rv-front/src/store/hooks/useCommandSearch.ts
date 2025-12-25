import { useState, useRef, useEffect } from 'react';
import type { DsCommand } from '../../api/Api';
import { cosineSimilarity } from '../../modules/math';

export interface IProcessedItem extends DsCommand {
    id: number;
    score: number;
    isVisible: boolean;
    embedding?: number[];
}

export const useCommandSearch = (commandsFromRedux: DsCommand[]) => { 
    const [items, setItems] = useState<IProcessedItem[]>([]);
    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const workerRef = useRef<Worker | null>(null);

    // 1. Инициализация при изменении команд из Redux
    useEffect(() => {
        const hasId = (item: DsCommand): item is DsCommand & { id: number } => {
            return item.id !== undefined && item.id !== null;
        };

        // Фильтруем и преобразуем команды
        const validCommands = commandsFromRedux.filter(hasId);
        const processedItems = validCommands.map(item => ({
            ...item,
            score: 0,
            isVisible: true
        }));

        setItems(processedItems);

        // Если есть команды, инициализируем воркер
        if (validCommands.length > 0) {
            initWorker(validCommands);
        } else {
            setReady(true); // Если команд нет, все равно готовы
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [commandsFromRedux]);

    const initWorker = (commands: (DsCommand & { id: number })[]) => {
        workerRef.current = new Worker(
            new URL('../../workers/search.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onerror = (error) => {
            console.error('Worker error:', error);
            setReady(false);
        };

        workerRef.current.onmessage = (e) => {
            const { type, data } = e.data;

            switch (type) {
                case 'progress':
                    if (data.status === 'progress') {
                        setProgress(data.progress);
                    } else if (data.status === 'ready') {
                        setReady(true);
                    }
                    break;
                
                case 'text_embeddings_ready':
                    setItems(prev => prev.map(item => ({
                        ...item,
                        embedding: data[item.id]
                    })));
                    setReady(true);
                    break;

                case 'image_embedding_ready':
                    setImageEmbedding(data);
                    break;

                case 'error':
                    console.error('Worker processing error:', data);
                    break;
            }
        };

        // Передаем команды в воркер для расчета эмбеддингов
        workerRef.current.postMessage({ 
            type: 'init', 
            data: commands 
        });
    };

    // 2. Поиск при изменении imageEmbedding
    useEffect(() => {
        if (!imageEmbedding || items.length === 0) return;

        setItems(prevItems => {
            if (!prevItems[0]?.embedding) return prevItems;

            const threshold = 0.005;
            const processed = prevItems.map(item => {
                if (!item.embedding) return item;
                
                const similarity = cosineSimilarity(imageEmbedding, item.embedding);
                return {
                    ...item,
                    score: similarity,
                    isVisible: similarity > threshold
                };
            });

            processed.sort((a, b) => b.score - a.score);
            return processed;
        });
    }, [imageEmbedding, items.length]);

    // 3. Методы управления
    const searchByImage = (file: File) => {
        if (workerRef.current && ready) {
            workerRef.current.postMessage({ type: 'image', data: file });
        }
    };

    const resetSearch = () => {
        setImageEmbedding(null);
        setItems(prev => {
            const sortedById = [...prev].sort((a, b) => a.id - b.id);
            return sortedById.map(item => ({
                ...item,
                score: 0,
                isVisible: true
            }));
        });
    };

    return {
        items,
        ready,
        progress,
        imageEmbedding,
        searchByImage,
        resetSearch
    };
};