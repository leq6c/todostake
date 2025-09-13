"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { LogOut, User, Shield, Key, Wallet, Copy, ExternalLink, Monitor } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"

type AccountModalProps = {}

export function AccountModal() {
  const { user, signOut } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [name, setName] = useState("")
  const email = useMemo(() => profile?.email || user?.email || (user?.isAnonymous ? "Guest" : ""), [profile, user])
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress] = useState("")
  
  // Sync local name with profile
  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile?.name])

  const handleSignOut = () => {
    void signOut()
  }

  const handleConnectWallet = () => {
    console.log("Connecting wallet...")
    setWalletConnected(true)
  }

  const handleDisconnectWallet = () => {
    console.log("Disconnecting wallet...")
    setWalletConnected(false)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    console.log("Address copied to clipboard")
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Profile</h4>
        </div>

        <div className="space-y-2">
          <div>
            <Label htmlFor="name" className="text-xs">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && updateProfile({ name: name.trim() })}
              className="text-sm h-8"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input id="email" value={email} disabled className="text-sm h-8 bg-muted" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Display Settings Section */}
      <div className="space-y-3 hidden">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Display</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Floating window mode</Label>
              <p className="text-xs text-muted-foreground">Show app as centered floating window instead of full screen</p>
            </div>
            <Switch
              checked={profile?.floatingWindowMode ?? true}
              onCheckedChange={(checked) => updateProfile({ floatingWindowMode: checked })}
            />
          </div>
        </div>
      </div>

      {/* Wallet Settings Section */}
      <div className={"space-y-3" + (profile?.walletConnected ? "" : " hidden")}>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Wallet</h4>
        </div>

        <div className="space-y-3">
          {walletConnected ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Connected Wallet</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`}
                    disabled
                    className="text-sm h-8 bg-muted flex-1"
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopyAddress}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(`https://solscan.io/account/${walletAddress}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-sm bg-transparent"
                onClick={handleDisconnectWallet}
              >
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-sm bg-transparent"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <Separator className={profile?.walletConnected ? "" : " hidden"} />

      {/* Security Section */}
      <div className="space-y-3 hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Security</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">End-to-end encryption</Label>
              <p className="text-xs text-muted-foreground">Encrypt your data locally</p>
            </div>
            <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Two-factor authentication</Label>
              <p className="text-xs text-muted-foreground">Add extra security</p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>
        </div>
      </div>

      <Separator className="hidden" />

      {/* Actions */}
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm hidden">
          <Key className="h-4 w-4" />
          Change Password
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-sm text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
