"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeDialog } from "@/components/ui/welcome-dialog";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useEffect, useState } from "react";
import { UserPlus, GraduationCap, Phone, Lock, IdCard, CheckCircle } from "lucide-react";
import { Career } from "@/types";
import { API_BASE_URL } from "@/lib/api-config";

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

const formSchema = z.object({
    first_name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres.")
        .max(30, "El nombre no puede tener más de 30 caracteres.")
        .regex(nameRegex, "El nombre solo puede contener letras y espacios."),
    last_name: z.string()
        .min(3, "El apellido debe tener al menos 3 caracteres.")
        .max(30, "El apellido no puede tener más de 30 caracteres.")
        .regex(nameRegex, "El apellido solo puede contener letras y espacios."),
    ci: z.string()
        .min(7, "La cédula debe tener al menos 7 caracteres.")
        .max(8, "La cédula no puede tener más de 8 caracteres."),
    semester: z.string().min(1, "Debe seleccionar un semestre."),
    career_id: z.string().min(1, "Debe seleccionar una carrera."),
    phone_prefix: z.string().length(4, "El prefijo debe tener 4 dígitos."),
    phone_number: z.string().length(7, "El número de teléfono debe tener 7 dígitos."),
    aura: z.string().min(1, "Debe seleccionar un nivel de habilidad."),
    days: z.array(z.string()).refine((value) => value.length > 0, {
        message: "Debes seleccionar al menos un día.",
    }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm_password"],
});

type PlayerRegistrationForm = z.infer<typeof formSchema>;

const days = [
    { id: "1", label: "Lunes" },
    { id: "2", label: "Martes" },
    { id: "3", label: "Miércoles" },
    { id: "4", label: "Jueves" },
    { id: "5", label: "Viernes" },
];

export default function PlayerRegistrationClient() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(true);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<PlayerRegistrationForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            ci: "",
            semester: "1",
            career_id: "",
            phone_prefix: "0412",
            phone_number: "",
            aura: "1000",
            days: [],
            password: "",
            confirm_password: "",
        },
    });

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/career`);
                if (!response.ok) {
                    throw new Error('Failed to fetch careers');
                }
                const data = await response.json();
                if (Array.isArray(data.data)) {
                    setCareers(data.data);
                    if (data.data.length > 0 && !form.getValues('career_id')) {
                        form.setValue('career_id', String(data.data[0].career_id), { shouldValidate: true });
                    }
                } else {
                    console.error("Fetched data for careers is not an array:", data);
                    setCareers([]);
                }
            } catch (error) {
                console.error("Error fetching careers:", error);
                setError("Error al cargar las carreras disponibles.");
                setCareers([]);
            }
        };
        fetchCareers();
    }, [form]);

    async function onSubmit(values: PlayerRegistrationForm) {
        setError(null);
        try {
            const payload = {
                playerData: {
                    ci: values.ci,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    phone: values.phone_prefix + values.phone_number,
                    semester: parseInt(values.semester, 10),
                    career_id: parseInt(values.career_id, 10),
                    aura: parseInt(values.aura, 10),
                    status: true,
                    days: values.days.map(day => parseInt(day, 10)),
                },
            };

            const credentialPayload = {
                player_ci: values.ci,
                password: values.password,
            };

            const playerResponse = await fetch(`${API_BASE_URL}/player`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!playerResponse.ok) {
                const errorData = await playerResponse.json();
                throw new Error(errorData.message || "Error al registrar al jugador. Intente con otra Cédula.");
            }

            const credentialResponse = await fetch(`${API_BASE_URL}/credential`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentialPayload),
            });

            if (!credentialResponse.ok) {
                const errorData = await credentialResponse.json();
                throw new Error(errorData.message || "Error al crear la credencial. Jugador registrado, pero no tiene acceso.");
            }

            setSuccessModalOpen(true);
            form.reset();

        } catch (err: any) {
            console.error("Error during registration:", err);
            setError(err.message || "Ha ocurrido un error inesperado al registrar.");
        }
    }

    return (
        <>
            <div className="">
                <WelcomeDialog isOpen={isWelcomeModalOpen} onClose={() => setWelcomeModalOpen(false)} />
                <SuccessDialog isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} />

                <div className="flex items-center justify-center min-h-[calc(90vh-64px)] py-12 mb-16">
                    <Card className="max-w-3xl w-full mx-4 bg-[#232339] border border-purple-700/50 shadow-2xl">
                        <CardHeader className="text-center p-6">
                            <div className="flex justify-center mb-4 text-purple-500">
                                <UserPlus size={48} />
                            </div>
                            <CardTitle className="text-3xl font-bold text-purple-500">Registro de Jugadores</CardTitle>
                            <p className="text-sm text-purple-400 mt-1">Completa el formulario con tus datos para unirte a los torneos.</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                    <div className="space-y-4 border-b border-slate-700/50 pb-6">
                                        <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                            <IdCard className="mr-2 h-5 w-5" />Datos Personales
                                        </h2>
                                        <div className="text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="first_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Nombres</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={30}
                                                                placeholder="Ingrese sus nombres"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const textValue = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                                    field.onChange(textValue);
                                                                }}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="last_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Apellidos</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={30}
                                                                placeholder="Ingrese sus apellidos"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const textValue = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                                    field.onChange(textValue);
                                                                }}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ci"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Cédula de Identidad</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={8}
                                                                placeholder="12345678"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                    field.onChange(numericValue);
                                                                }}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-b border-slate-700/50 pb-6">
                                        <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                            <GraduationCap className="mr-2 h-5 w-5" />Datos Académicos
                                        </h2>
                                        <div className="text-slate-200 flex items-start gap-4">
                                            <FormField
                                                control={form.control}
                                                name="semester"
                                                render={({ field }) => (
                                                    <FormItem className="w-1/4 min-w-[120px]">
                                                        <FormLabel className="text-slate-300">Semestre</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-100 focus:ring-purple-500">
                                                                    <SelectValue placeholder="1" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                                                {[1, 2, 3, 4, 5, 6].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="career_id"
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormLabel className="text-slate-300">Carrera</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            disabled={careers.length === 0}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-100 focus:ring-purple-500">
                                                                    <SelectValue placeholder={careers.length === 0 ? "Cargando carreras..." : "Seleccione carrera"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                                                {careers.map((career) => (
                                                                    <SelectItem
                                                                        key={career.career_id}
                                                                        value={String(career.career_id)}
                                                                    >
                                                                        {career.name_career}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-b border-slate-700/50 pb-6">
                                        <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                            <Phone className="mr-2 h-5 w-5" />Contacto
                                        </h2>
                                        <div className="text-slate-200 flex items-start gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phone_prefix"
                                                render={({ field }) => (
                                                    <FormItem className="w-1/3 flex-grow-0 flex-shrink-0 min-w-[120px]">
                                                        <FormLabel className="text-slate-300">Prefijo</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-100 focus:ring-purple-500">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                                                {["0412", "0422", "0414", "0424", "0416", "0426"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone_number"
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormLabel className="text-slate-300">Número</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={7}
                                                                placeholder="0552789"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                    field.onChange(numericValue);
                                                                }}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-b border-slate-700/50 pb-6">
                                        <h2 className="text-purple-500 text-xl font-semibold">Nivel y Disponibilidad</h2>
                                        <div className="text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="aura"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Nivel de Habilidad</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-100 focus:ring-purple-500">
                                                                    <SelectValue placeholder="Seleccione nivel" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                                                <SelectItem value="1000">Sin Experiencia (1000)</SelectItem>
                                                                <SelectItem value="1200">Principiante (1200)</SelectItem>
                                                                <SelectItem value="1400">Intermedio (1400)</SelectItem>
                                                                <SelectItem value="1600">Avanzado (1600)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="days"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="mb-2">
                                                            <FormLabel className="text-base text-slate-300">Disponibilidad (días de la semana)</FormLabel>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                                                            {days.map((item) => (
                                                                <FormField
                                                                    key={item.id}
                                                                    control={form.control}
                                                                    name="days"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={item.id}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(item.id)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            return checked
                                                                                                ? field.onChange([...field.value, item.id])
                                                                                                : field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (value) => value !== item.id
                                                                                                    )
                                                                                                );
                                                                                        }}
                                                                                        className="border-slate-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal text-slate-200 cursor-pointer">
                                                                                    {item.label}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                            <Lock className="mr-2 h-5 w-5" />Contraseña de Acceso
                                        </h2>
                                        <div className="text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Contraseña</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="Cree una contraseña"
                                                                {...field}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="confirm_password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">Confirmar Contraseña</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="Confirme su contraseña"
                                                                {...field}
                                                                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-red-500 text-sm font-medium text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}

                                    <div className="flex justify-center pt-4">
                                        <Button
                                            type="submit"
                                            variant="outstanding"
                                            className="w-full max-w-xs text-lg font-semibold h-12"
                                            disabled={form.formState.isSubmitting}
                                        >
                                            {form.formState.isSubmitting ? "Registrando..." : "Enviar Registro"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
