'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProfileAction } from '@/app/(app)/settings/actions';
import { AvatarUpload } from '@/components/shared/avatar-upload';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProfileForm({
  userId,
  fullName,
  phone,
  bio,
  avatarUrl,
  locale,
}: {
  userId: string;
  fullName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  locale: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [ph, setPh] = useState(phone);
  const [b, setB] = useState(bio);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [loc, setLoc] = useState(locale === 'ar' ? 'ar' : 'en');
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await updateProfileAction({
      fullName: name,
      phone: ph,
      bio: b,
      avatarUrl: avatar,
      locale: loc,
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Profile updated');
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <AvatarUpload
          userId={userId}
          value={avatar}
          fallback={(name || 'TC').slice(0, 2).toUpperCase()}
          onChange={setAvatar}
        />
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={ph} onChange={(e) => setPh(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={3} value={b} onChange={(e) => setB(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Preferred language</Label>
          <Select value={loc} onValueChange={setLoc}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
