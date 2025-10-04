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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { UserPlus, GraduationCap, Phone, Lock, IdCard, CheckCircle } from "lucide-react";
import { Career } from "@/types";

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
    available_days: z.array(z.string()).refine((value) => value.length > 0, {
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

export default function PlayerRegistrationPage() {
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
            available_days: [],
            password: "",
            confirm_password: "",
        },
    });

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch("https://lpp-backend.onrender.com/api/career");
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
                    available_days: values.available_days.map(day => parseInt(day, 10)),
                },
            };

            const credentialPayload = {
                player_ci: values.ci,
                password: values.password,
            };

            const playerResponse = await fetch("https://lpp-backend.onrender.com/api/player", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!playerResponse.ok) {
                const errorData = await playerResponse.json();
                throw new Error(errorData.message || "Error al registrar al jugador. Intente con otra Cédula.");
            }

            const credentialResponse = await fetch("https://lpp-backend.onrender.com/api/credential", {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PlayerRegistrationForm) => {
        const value = e.target.value;
        if (field === 'phone_number' || field === 'ci') {
            const numericValue = value.replace(/[^0-9]/g, '');
            form.setValue(field, numericValue as any);
            form.trigger(field);
        } else if (field === 'first_name' || field === 'last_name') {
            const textValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            form.setValue(field, textValue as any);
            form.trigger(field);
        } else {
            form.setValue(field, value as any);
            form.trigger(field);
        }
    };

    return (
        <>
            <div className="">
                <Dialog open={isWelcomeModalOpen} onOpenChange={setWelcomeModalOpen}>
                    <DialogContent className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-purple-400">Bienvenido al Registro de Jugadores</DialogTitle>
                            <DialogDescription asChild>
                                <div className="mt-4">
                                    <div className="text-lg p-4 bg-slate-800/50 rounded-lg">
                                        <h3 className="font-bold text-purple-300 mb-2">Términos y Condiciones:</h3>
                                        <ul className="text-sm pl-4 text-slate-300 list-disc list-inside space-y-1">
                                            <li>Participación voluntaria en torneos.</li>
                                            <li>Cumplir horarios establecidos y notificar ausencias.</li>
                                            <li>Respetar reglas de juego y a los demás participantes.</li>
                                            <li>Mantener una conducta deportiva y ética.</li>
                                            <li>Los datos proporcionados deben ser verídicos y obligatorios.</li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button className="w-full" variant={"outstanding"} onClick={() => setWelcomeModalOpen(false)}>Aceptar y Continuar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSuccessModalOpen} onOpenChange={setSuccessModalOpen}>
                    <DialogContent className="bg-[#2A2A3E]">
                        <DialogHeader>
                            <div className="flex flex-col items-center text-center p-4">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <DialogTitle className="text-2xl text-green-400">¡Registro Exitoso!</DialogTitle>
                                <DialogDescription className="text-slate-300 mt-2">
                                    Tu registro se ha completado correctamente.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <DialogFooter>
                            <Button className="w-full" variant="outstanding" onClick={() => setSuccessModalOpen(false)}>Cerrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                                                                onChange={(e) => handleInputChange(e, 'first_name')}
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
                                                                onChange={(e) => handleInputChange(e, 'last_name')}
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
                                                                onChange={(e) => handleInputChange(e, 'ci')}
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
                                                                onChange={(e) => handleInputChange(e, 'phone_number')}
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
                                                name="available_days"
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
                                                                    name="available_days"
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