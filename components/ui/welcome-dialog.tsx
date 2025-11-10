"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WelcomeDialog({ isOpen, onClose }: WelcomeDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                    <Button className="w-full" variant={"outstanding"} onClick={onClose}>Aceptar y Continuar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
