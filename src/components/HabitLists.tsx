import { Check } from 'phosphor-react';
import * as Checkbox from '@radix-ui/react-checkbox'
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

interface HabitListProps {
    date: Date
    onCompletedChange: (completed: number) => void
}

interface HabitsInfo {
    possibleHabits: Array<{
        id: string
        title: string
        created_at: string
    }>
    completedHabits: string[]
}

export function HabitLists({date, onCompletedChange}: HabitListProps){
    const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>()

    useEffect(()=>{
        api.get('day',{
            params: {
                date: date.toISOString()
            }
        }).then((response)=>{
            setHabitsInfo(response.data)
        })
    },[])

    const dateInPast = dayjs(date).endOf('day').isBefore(new Date())

    async function haddleToggleHabit(habitId: string){
        await api.patch(`/habits/${habitId}/toggle`)

        const isHabitAtReadyCompleted = habitsInfo!.completedHabits.includes(habitId)
        let completedHabits: string[] = []
        if(isHabitAtReadyCompleted){
            completedHabits = habitsInfo!.completedHabits.filter(id => id !== habitId)
        }else{
            completedHabits = [...completedHabits, habitId]
        }
        setHabitsInfo({
            possibleHabits: habitsInfo!.possibleHabits,
            completedHabits
        })

        onCompletedChange(completedHabits.length)
    }

    return (
        <div className="mt-6 flex flex-col gap-3">
            {habitsInfo?.possibleHabits.map((habit)=>{
                return(
                    <Checkbox.Root
                        key={habit.id}
                        className="flex items-center gap-3 group"
                        disabled={dateInPast}
                        checked={habitsInfo.completedHabits.includes(habit.id)}
                        onCheckedChange={()=>haddleToggleHabit(habit.id)}
                    >
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500">
                            <Checkbox.Indicator>
                                <Check size={20} color="#fff"/>
                            </Checkbox.Indicator>
                        </div>
                        <span 
                            className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                                {habit.title}
                        </span>
                    </Checkbox.Root>
                )
            })}
        </div>
    )
}