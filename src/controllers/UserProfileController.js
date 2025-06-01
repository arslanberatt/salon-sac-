import { useMutation, useQuery, gql } from '@apollo/client';
import { useState } from 'react';

// 🔍 1. Kullanıcı bilgilerini getir
const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      name
      phone
      email
    }
  }
`;

// 📝 2. Ad ve telefon güncelle
const UPDATE_MY_INFO = gql`
  mutation UpdateMyInfo($name: String, $phone: String) {
    updateMyInfo(name: $name, phone: $phone) {
      id
      name
      phone
    }
  }
`;

// 🔒 3. Şifre güncelle
const UPDATE_MY_PASSWORD = gql`
  mutation UpdateMyPassword($password: String!) {
    updateMyInfo(password: $password) {
      id
    }
  }
`;

export function useUserProfileController() {
  const { data, loading: loadingProfile } = useQuery(GET_MY_PROFILE);
  const [updateInfoMutation] = useMutation(UPDATE_MY_INFO);
  const [updatePasswordMutation] = useMutation(UPDATE_MY_PASSWORD);

  const userInfo = data?.me ?? null;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  // 👤 Bilgi Güncelleme Fonksiyonu
  const updateInfo = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateInfoMutation({
        variables: {
          name: form.name,
          phone: form.phone,
        },
      });
      alert('✅ Bilgileriniz güncellendi.');
    } catch (err) {
      alert('❌ Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Şifre Güncelleme Fonksiyonu
  const updatePassword = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert('❌ Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    try {
      await updatePasswordMutation({
        variables: {
          password: form.newPassword,
        },
      });
      alert('✅ Parolanız güncellendi.');
      setForm(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      alert('❌ Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    userInfo,
    form,
    setForm,
    loading: loading || loadingProfile,
    updateInfo,
    updatePassword,
  };
}
