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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useEffect, useState } from "react";
import { UserCog, GraduationCap, Phone, Lock, Search, AlertTriangle } from "lucide-react";
import { Career } from "@/types";
import { API_BASE_URL } from "@/lib/api-config";
import { differenceInMonths, parseISO } from "date-fns";

// Schema for the verification step
const verifySchema = z.object({
    ci: z.string()
        .min(7, "La cédula debe tener al menos 7 caracteres.")
        .max(8, "La cédula no puede tener más de 8 caracteres.")
        .regex(/^[0-9]+$/, "La cédula solo puede contener números."),
});

// Schema for the authentication step
const authSchema = z.object({
    password: z.string().min(1, "Debe ingresar su contraseña."),
});

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

// Schema for the update step (Strict validations matching registration)
const updateSchema = z.object({
    ci: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    aura: z.string(),
    status: z.boolean(),
    available_days: z.array(z.number()).refine((value) => value.length > 0, {
        message: "Debes seleccionar al menos un día.",
    }),
    semester: z.string().min(1, "Debe seleccionar un semestre."),
    career_id: z.string().min(1, "Debe seleccionar una carrera."),
    phone_prefix: z.string().length(4, "El prefijo debe tener 4 dígitos."),
    phone_number: z.string().length(7, "El número de teléfono debe tener 7 dígitos."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm_password"],
});

type VerifyFormValues = z.infer<typeof verifySchema>;
type AuthFormValues = z.infer<typeof authSchema>;
type UpdateFormValues = z.infer<typeof updateSchema>;

const days = [
    { id: 1, label: "Lunes" },
    { id: 2, label: "Martes" },
    { id: 3, label: "Miércoles" },
    { id: 4, label: "Jueves" },
    { id: 5, label: "Viernes" },
];

export default function DataRenewalClient() {
    const [step, setStep] = useState<"verify" | "auth" | "edit">("verify");
    const [careers, setCareers] = useState<Career[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playerData, setPlayerData] = useState<any>(null);
    const [tempCi, setTempCi] = useState<string>("");

    // Form for verification
    const verifyForm = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: { ci: "" },
    });

    // Form for authentication
    const authForm = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: { password: "" },
    });

    // Form for update
    const updateForm = useForm<UpdateFormValues>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            ci: "",
            first_name: "",
            last_name: "",
            aura: "",
            status: true,
            available_days: [],
            semester: "",
            career_id: "",
            phone_prefix: "0412",
            phone_number: "",
            password: "",
            confirm_password: "",
        },
    });

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/career`);
                if (!response.ok) throw new Error('Failed to fetch careers');
                const data = await response.json();
                if (Array.isArray(data.data)) {
                    setCareers(data.data);
                }
            } catch (error) {
                console.error("Error fetching careers:", error);
            }
        };
        fetchCareers();
    }, []);

    const prepareEditForm = (player: any) => {
        // Handle phone number splitting
        let phonePrefix = "0412";
        let phoneNumber = "";
        if (player.phone && player.phone.length >= 11) {
            phonePrefix = player.phone.substring(0, 4);
            phoneNumber = player.phone.substring(4);
        }

        // Map days to IDs
        const currentDays = player.Days ? player.Days.map((d: any) => d.day_id) : [];

        updateForm.reset({
            ci: player.ci,
            first_name: player.first_name,
            last_name: player.last_name,
            aura: String(player.aura),
            status: player.status,
            available_days: currentDays,
            semester: String(player.semester),
            career_id: String(player.career_id),
            phone_prefix: phonePrefix,
            phone_number: phoneNumber,
            password: "",
            confirm_password: "",
        });
        setStep("edit");
    };

    const onVerify = async (values: VerifyFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/player/${values.ci}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Jugador no encontrado.");
            }

            const data = await response.json();
            const player = data.data;

            if (!player) throw new Error("No se encontraron datos del jugador.");

            setPlayerData(player);
            setTempCi(player.ci);

            // Check if updated in last 5 months
            const lastUpdate = player.updatedAt ? parseISO(player.updatedAt) : new Date(0);
            const monthsDiff = differenceInMonths(new Date(), lastUpdate);

            if (monthsDiff < 5) {
                setStep("auth");
            } else {
                prepareEditForm(player);
            }

        } catch (err: any) {
            console.error("Error verifying player:", err);
            setError(err.message || "Error al verificar la cédula.");
        } finally {
            setIsLoading(false);
        }
    };

    const onAuth = async (values: AuthFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/credential/authenticate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    player_ci: tempCi,
                    password: values.password
                }),
            });

            if (!response.ok) {
                throw new Error("Contraseña incorrecta. En caso de no recordar su contraseña, contacte con un administrador.");
            }

            // Auth success
            prepareEditForm(playerData);

        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "Error de autenticación.");
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdate = async (values: UpdateFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Update Player Data
            const playerPayload = {
                playerData: {
                    ci: values.ci,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    phone: values.phone_prefix + values.phone_number,
                    semester: parseInt(values.semester, 10),
                    career_id: parseInt(values.career_id, 10),
                    aura: parseInt(values.aura, 10),
                    status: true,
                },
                available_days: values.available_days,
            };

            const playerResponse = await fetch(`${API_BASE_URL}/player/${values.ci}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playerPayload),
            });

            if (!playerResponse.ok) {
                const errorData = await playerResponse.json();
                throw new Error(errorData.message || "Error al actualizar datos del jugador.");
            }

            // 2. Update Credential (Password)
            const credentialPayload = {
                player_ci: values.ci,
                password: values.password,
            };

            const credentialResponse = await fetch(`${API_BASE_URL}/credential`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentialPayload),
            });

            if (!credentialResponse.ok) {
                const errorData = await credentialResponse.json();
                throw new Error(errorData.message || "Datos actualizados, pero error al actualizar contraseña.");
            }

            setSuccessModalOpen(true);
        } catch (err: any) {
            console.error("Error updating:", err);
            setError(err.message || "Error al actualizar los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(90vh-64px)] py-12 mb-16 px-4">
             <SuccessDialog 
                isOpen={isSuccessModalOpen} 
                onClose={() => {
                    setSuccessModalOpen(false);
                    window.location.reload(); 
                }} 
                title="¡Datos Actualizados!"
                description="Tu información se ha renovado exitosamente."
            />

            <Card className="max-w-3xl w-full bg-[#232339] border border-purple-700/50 shadow-2xl">
                <CardHeader className="text-center p-6">
                    <div className="flex justify-center mb-4 text-purple-500">
                        <UserCog size={48} />
                    </div>
                    <CardTitle className="text-3xl font-bold text-purple-500">Renovar Datos</CardTitle>
                    <p className="text-sm text-purple-400 mt-1">
                        {step === "verify" && "Ingrese su cédula para verificar sus datos."}
                        {step === "auth" && "Confirme su identidad para continuar."}
                        {step === "edit" && "Actualice su información y establezca una nueva contraseña."}
                    </p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    
                    {step === "verify" && (
                        <Form {...verifyForm}>
                             <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-6 max-w-sm mx-auto">
                                <FormField
                                    control={verifyForm.control}
                                    name="ci"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Cédula de Identidad</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                    <Input
                                                        maxLength={8}
                                                        placeholder="Ingrese su cédula"
                                                        {...field}
                                                        onChange={(e) => {
                                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                            field.onChange(numericValue);
                                                        }}
                                                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-center">
                                    <Button
                                        type="submit"
                                        variant="outstanding"
                                        className="w-full font-semibold h-11"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Verificando..." : "Verificar"}
                                    </Button>
                                </div>
                                {error && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}
                            </form>
                        </Form>
                    )}

                    {step === "auth" && (
                        <Form {...authForm}>
                            <form onSubmit={authForm.handleSubmit(onAuth)} className="space-y-6 max-w-sm mx-auto">
                                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20 mb-4 flex items-start gap-3">
                                    <AlertTriangle className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-yellow-200">
                                        Detectamos una actualización reciente en tus datos (hace menos de 5 meses). 
                                        Por seguridad, debes ingresar tu contraseña actual para continuar.
                                    </p>
                                </div>

                                <FormField
                                    control={authForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Contraseña Actual</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Ingresa tu contraseña"
                                                    {...field}
                                                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-center flex-col gap-3">
                                    <Button
                                        type="submit"
                                        variant="outstanding"
                                        className="w-full font-semibold h-11"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Autenticando..." : "Confirmar Contraseña"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setStep("verify");
                                            setError(null);
                                        }}
                                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                                {error && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}
                            </form>
                        </Form>
                    )}

                    {step === "edit" && (
                         <Form {...updateForm}>
                            <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-6">
                                {/* READ ONLY SECTION */}
                                <div className="space-y-4 border-b border-slate-700/50 pb-6 opacity-80">
                                   <h2 className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-3">Datos Personales (No editables)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400">Nombres</label>
                                            <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700">
                                                {updateForm.getValues("first_name")}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Apellidos</label>
                                             <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700">
                                                {updateForm.getValues("last_name")}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Cédula</label>
                                             <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700">
                                                {updateForm.getValues("ci")}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Nivel (Aura)</label>
                                             <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700">
                                                {updateForm.getValues("aura")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* EDITABLE SECTION */}
                                <div className="space-y-4 border-b border-slate-700/50 pb-6">
                                    <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                        <GraduationCap className="mr-2 h-5 w-5" />Datos Académicos
                                    </h2>
                                    <div className="text-slate-200 flex items-start gap-4">
                                        <FormField
                                            control={updateForm.control}
                                            name="semester"
                                            render={({ field }) => (
                                                <FormItem className="w-1/4 min-w-[120px]">
                                                    <FormLabel className="text-slate-300">Semestre</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            control={updateForm.control}
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
                                                                <SelectValue placeholder={careers.length === 0 ? "Cargando..." : "Seleccione carrera"} />
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
                                            control={updateForm.control}
                                            name="phone_prefix"
                                            render={({ field }) => (
                                                <FormItem className="w-1/3 flex-grow-0 flex-shrink-0 min-w-[120px]">
                                                    <FormLabel className="text-slate-300">Prefijo</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            control={updateForm.control}
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
                                    <FormField
                                        control={updateForm.control}
                                        name="available_days"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-2">
                                                    <FormLabel className="text-base font-semibold text-purple-500">Disponibilidad (días de la semana)</FormLabel>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                                                    {days.map((item) => (
                                                        <FormField
                                                            key={item.id}
                                                            control={updateForm.control}
                                                            name="available_days"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={item.id}
                                                                        className="flex flex-row items-center space-x-3 space-y-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value?.includes(item.id)}
                                                                                onCheckedChange={(checked: boolean) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, item.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== item.id
                                                                                            )
                                                                                        );
                                                                                }}
                                                                                className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-slate-700"
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

                                <div className="space-y-4">
                                    <h2 className="text-purple-500 text-xl font-semibold flex items-center">
                                        <Lock className="mr-2 h-5 w-5" />Nueva Contraseña
                                    </h2>
                                    <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20 mb-4">
                                        <p className="text-sm text-purple-300">
                                            Por seguridad, todas las contraseñas anteriores fueron reiniciadas. 
                                            Debes establecer una nueva contraseña para acceder a tu cuenta.
                                        </p>
                                    </div>
                                    <div className="text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={updateForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Nueva contraseña"
                                                            {...field}
                                                            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={updateForm.control}
                                            name="confirm_password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">Confirmar Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Confirmar nueva contraseña"
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
                                        className="w-full max-w-xs text-lg font-semibold h-11"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Actualizando..." : "Actualizar Datos"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
