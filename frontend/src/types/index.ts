export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: number;
  doctor_id: number;
  doctor_name: string;
  specialty: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  medical_info?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_address: string;
  medical_info?: string;
  doctor_name: string;
  specialty: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  channel: string;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: Admin;
}
