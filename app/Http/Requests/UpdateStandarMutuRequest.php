<?php

namespace App\Http\Requests;

use App\Models\StandarMutu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStandarMutuRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $standarMutu = $this->route('standarMutu');
        return $this->user()->can('update', $standarMutu);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $standarMutuId = $this->route('standarMutu')->id;
        return [
            'kode' => ['required', 'string', Rule::unique('standar_mutu')->ignore($standarMutuId)],
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
        ];
    }
}
