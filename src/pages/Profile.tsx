import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const showProfileDetails = () => {
    console.log({
      username: userName,
      email: userEmail,
    });
  };

  const handleProfilePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl flex-center mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Changed grid columns and width */}
        <div className="grid relative lg:grid-cols-5 items-center w-full">
          <div className="lg:col-span-1" />
          {/* Status Panel - increased column span */}
          <div className="space-y-6 lg:col-span-3">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-transparent border-[#00BFFF] text-white'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader className="items-center">
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  <p className="text-3xl font-normal tracking-widest flex-center pb-7">
                    PROFILE
                  </p>
                </CardTitle>
                <div className="w-full max-w-2xl space-y-4 px-4 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#00BFFF]">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                          }`}
                        >
                          <span className="text-4xl text-gray-400">👤</span>
                        </div>
                      )}
                    </div>

                    <label
                      htmlFor="profile-photo"
                      className="mt-4 cursor-pointer"
                    >
                      <Input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhoto}
                      />
                    </label>
                  </div>
                </div>
                <div className="w-full max-w-2xl space-y-8 px-4">
                  <TextField
                    id="Name"
                    label="Name"
                    margin="dense"
                    variant="outlined"
                    size="medium"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: '1px solid white',
                        },
                        '&:hover fieldset': {
                          border: '2px solid white',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #00BFFF',
                        },
                        input: {
                          color: theme === 'dark' ? '#FFFFFF' : '#000000', // Input text color
                          fontFamily: 'Inter, sans-serif', // Custom font family
                          fontSize: '1rem',
                          fontWeight: 400,
                          letterSpacing: '0.025em',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#fff', // Label color
                        fontFamily: 'Inter, sans-serif',
                        '&.Mui-focused': {
                          color: '#00BFFF', // Focused label color
                        },
                      },
                    }}
                  />
                  <TextField
                    id="Email"
                    label="Email"
                    margin="dense"
                    variant="outlined"
                    size="medium"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: '1px solid white',
                        },
                        '&:hover fieldset': {
                          border: '2px solid white',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #00BFFF',
                        },
                        input: {
                          color: theme === 'dark' ? '#FFFFFF' : '#000000', // Input text color
                          fontFamily: 'Inter, sans-serif', // Custom font family
                          fontSize: '1rem',
                          fontWeight: 400,
                          letterSpacing: '0.025em',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#fff', // Label color
                        fontFamily: 'Inter, sans-serif',
                        '&.Mui-focused': {
                          color: '#00BFFF', // Focused label color
                        },
                      },
                    }}
                  />
                  <Button
                    size="lg"
                    onClick={showProfileDetails} // Remove the arrow function
                    className={`text-lg py-3 w-full h-14 mb-10 ${
                      theme === 'dark'
                        ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                        : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                    }`}
                  >
                    Update Profile
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
          <div className="lg:col-span-1" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
