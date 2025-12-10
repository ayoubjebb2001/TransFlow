import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';

const RegisterForm = ({
    values,
    errors,
    onChange,
    onSubmit,
    loading
}) => {
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'chauffeur', label: 'Chauffeur' }
    ];

    const isChauffeur = values.role === 'chauffeur';

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Input
                label="Name"
                name="name"
                value={values.name}
                onChange={onChange}
                error={errors.name}
                placeholder="Enter your name"
                autoComplete="name"
            />

            <Input
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={onChange}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="email"
            />

            <Input
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={onChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="new-password"
            />

            <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={onChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
            />

            <Select
                label="Role"
                name="role"
                value={values.role}
                onChange={onChange}
                error={errors.role}
                options={roleOptions}
            />

            {isChauffeur && (
                <>
                    <Input
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={onChange}
                        error={errors.phone}
                        placeholder="Enter phone number"
                    />

                    <Input
                        label="License Number"
                        name="licenseNumber"
                        value={values.licenseNumber}
                        onChange={onChange}
                        error={errors.licenseNumber}
                        placeholder="Enter license number"
                    />

                    <Input
                        label="Service Years"
                        name="serviceYears"
                        type="number"
                        min="0"
                        value={values.serviceYears}
                        onChange={onChange}
                        error={errors.serviceYears}
                        placeholder="Years of service (optional)"
                    />
                </>
            )}

            <Button type="submit" loading={loading}>
                Register
            </Button>
        </form>
    );
};

export default RegisterForm;
