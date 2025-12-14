import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, User, Shield, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLES, ROLE_PERMISSIONS } from '../contexts/AuthContext';

export default function LoginPage({ onNavigate, onLogin }) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const exampleAccounts = [
    {
      role: 'director',
      icon: Shield,
      title: language === 'ru' ? 'Директор' : language === 'uz' ? 'Direktor' : 'Director',
      email: 'director@topex.uz',
      password: 'director123',
      color: 'from-purple-500 to-indigo-600',
      description: language === 'ru' ? 'Полный доступ ко всем функциям' : 
                   language === 'uz' ? 'Barcha funksiyalarga to\'liq kirish' : 
                   'Full access to all features',
    },
    {
      role: 'vice_director',
      icon: User,
      title: language === 'ru' ? 'Завуч' : language === 'uz' ? 'O\'quv ishlari bo\'yicha' : 'Vice Director',
      email: 'zavuch@topex.uz',
      password: 'zavuch123',
      color: 'from-blue-500 to-cyan-600',
      description: language === 'ru' ? 'Управление учителями и учениками' : 
                   language === 'uz' ? 'O\'qituvchilar va o\'quvchilarni boshqarish' : 
                   'Manage teachers and students',
    },
    {
      role: 'teacher',
      icon: GraduationCap,
      title: language === 'ru' ? 'Учитель' : language === 'uz' ? 'O\'qituvchi' : 'Teacher',
      email: 'teacher@topex.uz',
      password: 'teacher123',
      color: 'from-primary-500 to-emerald-600',
      description: language === 'ru' ? 'Рейтинг и доход' : 
                   language === 'uz' ? 'Reyting va daromad' : 
                   'Rating and income',
    },
    {
      role: 'student',
      icon: BookOpen,
      title: language === 'ru' ? 'Ученик' : language === 'uz' ? 'O\'quvchi' : 'Student',
      email: 'student@topex.uz',
      password: 'student123',
      color: 'from-orange-500 to-red-600',
      description: language === 'ru' ? 'Личный кабинет' : 
                   language === 'uz' ? 'Shaxsiy kabinet' : 
                   'Personal cabinet',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const fillExample = (account) => {
    setFormData({
      email: account.email,
      password: account.password,
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('register.emailError');
    }

    if (!formData.password) {
      newErrors.password = t('register.passwordError');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrors({ submit: t('login.error') });
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        onLogin(data.user);
        
        setTimeout(() => {
          if (profile?.role && ROLE_PERMISSIONS[profile.role]?.canAccessAdmin) {
            onNavigate('admin');
          } else {
            onNavigate('home');
          }
        }, 500);
      }
    } catch (error) {
      setErrors({ submit: t('register.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 relative overflow-hidden ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-grid' : ''}`}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Login Form */}
          <div>
            <div className="text-center lg:text-left mb-8">
              <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('login.title')}
              </h1>
              <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
                {language === 'ru' ? 'Добро пожаловать в Topex School' : 
                 language === 'uz' ? 'Topex School ga xush kelibsiz' : 
                 'Welcome to Topex School'}
              </p>
            </div>

            <div className={`rounded-3xl p-8 ${
              isDark 
                ? 'bg-dark-900/50 border border-dark-800 backdrop-blur-xl' 
                : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              {errors.submit && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                    {t('login.email')}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`w-full pl-14 pr-5 py-4 rounded-2xl border-2 bg-transparent transition-all duration-300 outline-none ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500'
                          : isDark 
                            ? 'border-dark-700 text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20' 
                            : 'border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400"></div>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-14 pr-14 py-4 rounded-2xl border-2 bg-transparent transition-all duration-300 outline-none ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500'
                          : isDark 
                            ? 'border-dark-700 text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20' 
                            : 'border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${
                        isDark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400"></div>
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {language === 'ru' ? 'Вход...' : language === 'uz' ? 'Kirilmoqda...' : 'Logging in...'}
                    </>
                  ) : (
                    <>
                      {t('login.login')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className={`mt-8 pt-8 border-t text-center ${isDark ? 'border-dark-800' : 'border-gray-200'}`}>
                <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
                  {language === 'ru' ? 'Нет аккаунта?' : language === 'uz' ? 'Akkaunt yo\'qmi?' : 'No account?'}{' '}
                  <button
                    onClick={() => onNavigate('register')}
                    className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  >
                    {language === 'ru' ? 'Зарегистрируйтесь' : language === 'uz' ? "Ro'yxatdan o'ting" : 'Register'}
                  </button>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center lg:text-left">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm transition-colors ${isDark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('common.back')}
              </button>
            </div>
          </div>

          {/* Example Accounts */}
          <div>
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'ru' ? 'Демо аккаунты' : language === 'uz' ? 'Demo akkauntlar' : 'Demo Accounts'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                {language === 'ru' ? 'Нажмите на карточку, чтобы заполнить форму' : 
                 language === 'uz' ? 'Formani to\'ldirish uchun kartani bosing' : 
                 'Click on a card to fill the form'}
              </p>
            </div>

            <div className="space-y-4">
              {exampleAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => fillExample(account)}
                  className={`w-full p-5 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl ${
                    isDark 
                      ? 'bg-dark-900/50 border border-dark-800 hover:border-primary-500/50' 
                      : 'bg-white border border-gray-200 hover:border-primary-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <account.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {account.title}
                        </h3>
                        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${
                          isDark ? 'text-primary-400' : 'text-primary-500'
                        }`} />
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        {account.description}
                      </p>
                      <div className={`flex flex-wrap gap-4 text-xs font-mono ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {account.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {account.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`mt-6 p-4 rounded-2xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                ⚠️ {language === 'ru' ? 'Это демо аккаунты для тестирования. Используйте их для знакомства с системой.' : 
                    language === 'uz' ? 'Bu test uchun demo akkauntlar. Ularni tizim bilan tanishish uchun ishlating.' : 
                    'These are demo accounts for testing. Use them to explore the system.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
