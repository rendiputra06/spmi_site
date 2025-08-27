import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SurveyHeaderCard({ survey }: { survey: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{survey.name}</span>
          <Badge variant={survey.is_active ? 'default' : 'secondary'}>
            {survey.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        {survey.description && <p>{survey.description}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-medium">Mulai: </span>
            <span>{survey.starts_at || '-'}</span>
          </div>
          <div>
            <span className="font-medium">Selesai: </span>
            <span>{survey.ends_at || '-'}</span>
          </div>
          <div>
            <span className="font-medium">Pertanyaan: </span>
            <span>{(survey.questions || []).length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
