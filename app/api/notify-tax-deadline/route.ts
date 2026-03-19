import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // 1. 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 2. 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    // 3. 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }

    // 4. 上传文件到Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('gallery') // 确保这个bucket存在
      .upload(fileName, file);

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' }, { status: 500 });
    }

    // 5. 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);

    // 6. 保存到数据库
    const { error: dbError } = await supabase
      .from('gallery_images') // 确保这个表存在
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        category: category,
        description: description,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // 如果数据库插入失败，删除已上传的文件
      await supabase.storage.from('gallery').remove([fileName]);
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
    }

    // 7. 返回成功响应
    return NextResponse.json({
      message: 'อัปโหลดสำเร็จ',
      data: {
        id: uuidv4(),
        url: publicUrl,
        category,
        description,
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}