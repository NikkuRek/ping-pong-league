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
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function SuccessDialog({ isOpen, onClose, title, description }: SuccessDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#2A2A3E]">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center p-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <DialogTitle className="text-2xl text-green-400">{title || "¡Registro Exitoso!"}</DialogTitle>
                        <DialogDescription className="text-slate-300 mt-2">
                            {description || "Tu registro se ha completado correctamente."}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button className="w-full" variant="outstanding" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
