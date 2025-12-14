import { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader, Briefcase, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLES, SUBJECTS } from '../contexts/AuthContext';

export default function RegisterPage({ onNavigate, onLogin }) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    subject: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1);

  const roles = [
    { id: ROLES.DIRECTOR, label: t('roles.director'), icon: '👔', color: 'from-purple-500 to-indigo-600' },
    { id: ROLES.VICE_DIRECTOR, label: t('roles.vice_director'), icon: '📋', color: 'from-blue-500 to-cyan-600' },
    { id: ROLES.TEACHER, label: t('roles.teacher'), icon: '👨‍🏫', color: 'from-primary-500 to-emerald-600' },
    { id: ROLES.STUDENT, label: t('roles.student'), icon: '📚', color: 'from-orange-500 to-red-600' },
  ];

  const subjects = SUBJECTS.map(sub => ({
    id: sub.id,
    label: sub.name[language] || sub.name.ru,
  }));

  const needsSubject = formData.role === ROLES.TEACHER;

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.role) {
        newErrors.role = t('register.roleRequired');
      }
      if (needsSubject && !formData.subject) {
        newErrors.subject = t('register.subjectRequired');
      }
    }

    if (currentStep === 2) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = t('register.nameError');
      }
      if (!formData.email.trim()) {
        newErrors.email = t('register.emailError');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('register.emailInvalid');
      }
      if (!formData.phone.trim()) {
        newErrors.phone = t('register.phoneError');
      }
      if (!formData.password) {
        newErrors.password = t('register.passwordError');
      } else if (formData.password.length < 6) {
        newErrors.password = t('register.passwordShort');
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('register.passwordMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId, subject: '' }));
    setErrors({});
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrors({ submit: authError.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        const profileData = {
          user_id: data.user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          subject: needsSubject ? formData.subject : null,
          rating: formData.role === ROLES.TEACHER ? 0 : null,
          income: formData.role !== ROLES.STUDENT ? 0 : null,
          activity_points: formData.role === ROLES.TEACHER ? 0 : null,
          attendance_points: formData.role === ROLES.TEACHER ? 0 : null,
        };

        await supabase.from('profiles').insert(profileData);

        setSuccessMessage(t('register.success'));
        
        if (onLogin) onLogin(data.user);
        
        setTimeout(() => {
          if (formData.role !== ROLES.STUDENT) {
            onNavigate('admin');
          } else {
            onNavigate('home');
          }
        }, 1500);
      }
    } catch (error) {
      setErrors({ submit: t('register.error') });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-14 pr-5 py-4 rounded-2xl border-2 bg-transparent transition-all duration-300 outline-none ${
    isDark 
      ? 'border-dark-700 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20' 
      : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
  }`;

  const inputErrorClass = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20';

  return (
    <div className={`min-h-screen py-12 relative overflow-hidden ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-grid' : ''}`}></div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('register.title')}
          </h1>
          <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
            {language === 'ru' ? 'Присоединяйтесь к Topex School' : 
             language === 'uz' ? "Topex School ga qo'shiling" : 
             'Join Topex School'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                step >= s 
                  ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white' 
                  : isDark ? 'bg-dark-800 text-dark-500' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 2 && (
                <div className={`w-20 h-1 rounded-full transition-all duration-300 ${
                  step > s 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500' 
                    : isDark ? 'bg-dark-800' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className={`rounded-3xl p-8 ${
          isDark 
            ? 'bg-dark-900/50 border border-dark-800 backdrop-blur-xl' 
            : 'bg-white border border-gray-200 shadow-xl'
        }`}>
          {errors.submit && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.selectRole')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-5 rounded-2xl text-left transition-all duration-300 border-2 hover:-translate-y-1 ${
                        formData.role === role.id
                          ? `bg-gradient-to-br ${role.color} border-transparent text-white shadow-lg`
                          : isDark 
                            ? 'bg-dark-800/50 border-dark-700 hover:border-primary-500/50' 
                            : 'bg-gray-50 border-gray-200 hover:border-primary-500/50'
                      }`}
                    >
                      <span className="text-3xl mb-3 block">{role.icon}</span>
                      <span className={`font-bold block ${formData.role === role.id ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-red-400 text-sm mt-2">{errors.role}</p>
                )}
              </div>

              {needsSubject && (
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                    {t('register.selectSubject')}
                  </label>
                  <div className="relative">
                    <BookOpen className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`${inputClass} ${errors.subject ? inputErrorClass : ''} appearance-none cursor-pointer`}
                    >
                      <option value="">{t('register.selectSubject')}</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.subject && (
                    <p className="text-red-400 text-sm mt-2">{errors.subject}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.role}
                className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'ru' ? 'Продолжить' : language === 'uz' ? 'Davom etish' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected Role Badge */}
              <div className={`p-4 rounded-2xl flex items-center justify-between ${isDark ? 'bg-dark-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{roles.find(r => r.id === formData.role)?.icon}</span>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {roles.find(r => r.id === formData.role)?.label}
                    </p>
                    {formData.subject && (
                      <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        {subjects.find(s => s.id === formData.subject)?.label}
                      </p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-primary-400 text-sm font-medium hover:underline">
                  {language === 'ru' ? 'Изменить' : language === 'uz' ? "O'zgartirish" : 'Change'}
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.fullName')}
                </label>
                <div className="relative">
                  <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={language === 'ru' ? 'Иван Петров' : language === 'uz' ? 'Ism Familiya' : 'John Doe'}
                    className={`${inputClass} ${errors.fullName ? inputErrorClass : ''}`}
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-sm mt-2">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.email')}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`${inputClass} ${errors.email ? inputErrorClass : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.phone')}
                </label>
                <div className="relative">
                  <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+998 99 123 45 67"
                    className={`${inputClass} ${errors.phone ? inputErrorClass : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-sm mt-2">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.password')}
                </label>
                <div className="relative">
                  <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} pr-14 ${errors.password ? inputErrorClass : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-5 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                  {t('register.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} pr-14 ${errors.confirmPassword ? inputErrorClass : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-5 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-2">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {language === 'ru' ? 'Регистрация...' : language === 'uz' ? "Ro'yxatdan o'tmoqda..." : 'Registering...'}
                  </>
                ) : (
                  <>
                    {t('register.register')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className={`mt-8 pt-8 border-t text-center ${isDark ? 'border-dark-800' : 'border-gray-200'}`}>
            <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>
              {language === 'ru' ? 'Уже есть аккаунт?' : language === 'uz' ? 'Akkaunt bormi?' : 'Already have an account?'}{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                {t('header.login')}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm transition-colors ${isDark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
