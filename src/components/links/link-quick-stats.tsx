import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface LinkQuickStatsProps {
    totalClicks: number,
}

export default function LinkQuickStats({ totalClicks }: LinkQuickStatsProps){
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Clicks</span>
                    <span className="font-semibold">{totalClicks}</span>
                </div>
            </CardContent>
        </Card>
    )
}