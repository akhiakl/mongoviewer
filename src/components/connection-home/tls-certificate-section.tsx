import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

export function TlsCertificateSection({ tlsCertificatePath, onTlsCertificatePathChange, onPickTlsCertificate }: {
    tlsCertificatePath: string;
    onTlsCertificatePathChange: (v: string) => void;
    onPickTlsCertificate: () => Promise<void>;
}) {
    return (
        <div className="space-y-1.5 mt-2" >
            <div className="flex items-center justify-between gap-3" >
                <div className="flex items-center gap-1" >
                    <Label htmlFor="tls-certificate-path" > TLS certificate file(optional) </Label>
                    < Tooltip >
                        <TooltipTrigger asChild >
                            <span className="cursor-pointer text-muted-foreground" >ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            PEM file for secure connections.Only needed for self - signed or custom CAs.
                        </TooltipContent>
                    </Tooltip>
                </div>
                < div className="flex items-center gap-2" >
                    {
                        tlsCertificatePath ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => onTlsCertificatePathChange('')
                                }
                            >
                                Clear
                            </Button>
                        ) : null}
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            void onPickTlsCertificate();
                        }}
                    >
                        Choose File
                    </Button>
                </div>
            </div>
            < Input
                id="tls-certificate-path"
                value={tlsCertificatePath}
                readOnly
                placeholder="No file selected"
            />
            <p className="text-xs text-muted-foreground" >
                The selected certificate is copied into app storage with a unique file name.
            </p>
        </div>
    );
}